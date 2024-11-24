import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icons from '../Icons';
import {useNavigation} from '@react-navigation/native';
import {retrieveData} from '../utils/Storage';
import axios from 'axios';
import {BASE_URL} from '../global/server';

const SuccessStories = () => {
  const navigation = useNavigation();

  const [successStories, setSuccessStories] = useState([]);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');

  const getSuccessStories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/story/`, {
        headers: {
          token: `Bearer ${token}`,
        },
      });
      console.log('response ', response.data);
      setSuccessStories(response.data.reverse());
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    const getTokenUserId = async () => {
      try {
        const storedToken = await retrieveData('token');
        setToken(storedToken);
        const storedUserId = await retrieveData('userId');
        setUserId(storedUserId);
      } catch (error) {
        console.log('Error:', error);
      }
    };
    getTokenUserId();
  }, []);

  useEffect(() => {
    if (token && userId) {
      getSuccessStories().catch(error => console.log('Error:', error));
    }
  }, [token, userId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.AntDesign name="arrowleft" size={25} color={'black'} />
        </TouchableOpacity>
        <Text style={styles.title}>GSB Success Stories</Text>
        <View style={{width: 25}}></View>
      </View>
      <ScrollView style={styles.scrollView}>
        {successStories.map((item, index) => {
          console.log('img url ', item?.storyImg?.secure_url);
          const imageUrl = item?.storyImg?.secure_url;
          return (
            <View key={index} style={styles.storyCard}>
              <View style={styles.imageContainer}>
                {imageUrl ? (
                  <Image source={{uri: imageUrl}} style={styles.imageStyle} />
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>No Image</Text>
                  </View>
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.titleText}>{item?.title}</Text>
                <Text style={styles.descriptionText}>{item?.description}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => {
            navigation.navigate('AddMySuccessStory');
          }}>
          <Text style={styles.submitButtonText}>Add Story</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SuccessStories;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  title: {
    fontSize: 18,
    color: 'black',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  storyCard: {
    width: '100%',
    backgroundColor: '#ffe6c6',
    borderRadius: 15,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  imageContainer: {
    height: 220,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
  imageStyle: {
    height: '100%',
    width: '100%',
    borderRadius: 16,
  },
  noImageContainer: {
    height: '100%',
    width: '100%',
    borderRadius: 16,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: 'gray',
  },
  textContainer: {
    marginTop: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
  },
  descriptionText: {
    color: 'black',
  },
  addButtonContainer: {
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#F6AF24',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});