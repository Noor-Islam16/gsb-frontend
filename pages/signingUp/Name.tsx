import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Icons from '../../Icons';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {retrieveData} from '../../utils/Storage';
import {BASE_URL, postData} from '../../global/server';
import axios from 'axios';

const Name = () => {
  const navigation = useNavigation();

  const [name, setName] = useState<string>('');

  const [token, setToken] = useState<string>(''); // State to store token
  const userId = useSelector((state: RootState) => state.auth.user?._id); // Fetch user ID from Redux store, corrected property access
  const storedName = useSelector((state: RootState) => state.auth?.user?.name); // Fetch user name from Redux store

  useFocusEffect(
    React.useCallback(() => {
      if (storedName) {
        navigation.navigate('Age'); // If name is already in Redux store, navigate to next screen
      }
    }, [storedName, navigation]),
  );

  useEffect(() => {
    const getToken = async () => {
      const storedToken = await retrieveData('token'); // Retrieve token from AsyncStorage
      setToken(storedToken);
    };
    getToken();
  }, []);

  const handleNameChange = (text: string) => {
    setName(text);
  };

  console.log(token);
  console.log(userId);

  const handleNextStep = async () => {
    const url = `${BASE_URL}/api/user/${userId}`;

    console.log(url);

    try {
      const response = await axios.put(
        url,
        {name},
        {headers: {token: `Bearer ${token}`}},
      );
      console.log('Response from update:', response); // Add this line
      if (response) {
        navigation.navigate('Age');
      } else {
        console.error('Failed to update user data:', response);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{marginBottom: 10}}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}>
          <Icons.AntDesign name="arrowleft" size={25} color={'black'} />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Step 3 of 8</Text>
      <Text style={styles.title}>What's your Name?</Text>

      <View style={styles.subcontainer}>
        <View style={{flexDirection: 'row', width: '80%'}}>
          <Text
            style={{
              color: 'black',
              textAlign: 'left',
              fontSize: 18,
              fontWeight: '600',
            }}>
            Write your Name
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={handleNameChange}
            value={name}
            placeholder="John Doe"
            placeholderTextColor={'black'}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleNextStep}>
        <Text style={styles.buttonText}>Next Step</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Name;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  subcontainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '500',
    // paddingLeft: 20,
    color: 'black',
  },
  subtitle: {
    fontSize: 16,
    // paddingLeft: 20,
    color: 'black',
  },
  button: {
    backgroundColor: '#F6AF24',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: '20%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 20,
    width: '30%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    width: '80%',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    paddingHorizontal: 10,
    color: 'black',
  },
  unit: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});