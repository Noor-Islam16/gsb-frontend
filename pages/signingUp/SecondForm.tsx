import React, {useEffect, useState, useRef} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icons from '../../Icons';
import gsbLogo from '../../assets/gsbtransparent.png';
import {completeSignup} from '../../redux/authSlice';
import {useDispatch} from 'react-redux';
import {retrieveData, storeData} from '../../utils/Storage';
import {getData} from '../../global/server';

const ServiceData = [
  {
    questionText: 'What type of diabetes do you have?',
    options: ['Type 1', 'Type 2', 'Diabetes during pregnancy'],
    isMultipleChoice: false,
    isTextInput: false,
  },
  {
    questionText: 'What is your sugar level?',
    options: [
      'Fasting. ___________________________',
      'Postprandial. ___________________________',
    ],
    isMultipleChoice: false,
    isTextInput: true,
  },
  {
    questionText: 'What is your per day insulin dosage?',
    options: [''],
    isMultipleChoice: false,
    isTextInput: true,
  },
  {
    questionText: 'Are you taking any medication for diabetes?',
    options: [''],
    isMultipleChoice: false,
    isTextInput: true,
  },
  {
    questionText: 'What symptoms are you facing?',
    options: [
      'Thrist',
      'Frequent urination',
      'Fatigue',
      'Blurry Vision',
      'Pain in feet / leg',
    ],
    isMultipleChoice: true,
    isTextInput: false,
  },
  {
    questionText: 'Is anyone in your family suffering from diabetes?',
    options: ['Yes', 'No'],
    isMultipleChoice: false,
    isTextInput: false,
  },
  {
    questionText: 'You are suffering from diabetes from :',
    options: [
      '0-1 years',
      '1-5 years',
      '5-10 years',
      '10-15 years',
      'More than 15 years',
    ],
    isMultipleChoice: false,
    isTextInput: false,
  },
  {
    questionText: 'Are you taking insulin doses ?',
    options: ['Yes', 'No'],
    isMultipleChoice: false,
    isTextInput: false,
  },
];

const SecondForm = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const {nextIndex, selectedGoals, onReturn} = route.params || {};

  const [selectedAnswers, setSelectedAnswers] = useState(
    Array.from({length: ServiceData.length}, () => new Set()),
  );
  const [textInputAnswers, setTextInputAnswers] = useState(
    Array(ServiceData.length).fill(''),
  );
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const textInputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const getTokenUserId = async () => {
      try {
        const storedToken = await retrieveData('token');
        setToken(storedToken);
        const storedUserId = await retrieveData('userId');
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error retrieving token/userId:', error);
      }
    };
    getTokenUserId();
  }, []);

  useEffect(() => {
    // Check if all questions are answered
    const isComplete = ServiceData.every((question, index) => {
      if (question.isTextInput) {
        return textInputAnswers[index].trim().length > 0;
      }
      return selectedAnswers[index].size > 0;
    });
    setIsFormComplete(isComplete);
  }, [selectedAnswers, textInputAnswers]);

  const handleSingleChoiceSelect = (
    questionIndex: number,
    answerIndex: number,
  ) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = new Set([answerIndex]);
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleMultipleChoiceSelect = (
    questionIndex: number,
    answerIndex: number,
  ) => {
    const newSelectedAnswers = [...selectedAnswers];
    const selectedSet = new Set(newSelectedAnswers[questionIndex]);

    if (selectedSet.has(answerIndex)) {
      selectedSet.delete(answerIndex);
    } else {
      selectedSet.add(answerIndex);
    }

    newSelectedAnswers[questionIndex] = selectedSet;
    setSelectedAnswers(newSelectedAnswers);
  };

  const handleTextInputChange = (questionIndex: number, text: string) => {
    const newTextInputAnswers = [...textInputAnswers];
    newTextInputAnswers[questionIndex] = text;
    setTextInputAnswers(newTextInputAnswers);
  };

  const handleSubmit = async () => {
    try {
      // Prepare the results, combining both selected and text input answers
      const result = ServiceData.map((question, index) => ({
        question: question.questionText,
        selectedOptions: question.isTextInput
          ? [textInputAnswers[index]]
          : Array.from(selectedAnswers[index]).map(i => question.options[i]),
      }));

      console.log('Form Results:', result);

      // Check if there are more goals to process
      if (nextIndex < selectedGoals.length) {
        const nextPage =
          selectedGoals[nextIndex] === 2
            ? 'SecondForm'
            : selectedGoals[nextIndex] === 3
            ? 'ThirdForm'
            : 'FirstForm';

        navigation.navigate(nextPage as never, {
          nextIndex: nextIndex + 1,
          selectedGoals,
          onReturn,
        });
      } else {
        onReturn(); // Go back to the selection page after the last page
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const renderQuestion = (item: any, questionIndex: number) => {
    if (item.isTextInput) {
      return (
        <TouchableOpacity
          style={styles.answer}
          onPress={() => textInputRefs.current[questionIndex]?.focus()}
          activeOpacity={1}>
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: textInputAnswers[questionIndex]
                  ? '#F6AF24'
                  : 'transparent',
              },
            ]}
          />
          <TextInput
            ref={input => (textInputRefs.current[questionIndex] = input)}
            style={styles.answerTextInput}
            placeholder="Type your answer here"
            onChangeText={text => handleTextInputChange(questionIndex, text)}
            value={textInputAnswers[questionIndex]}
            underlineColorAndroid="transparent"
          />
        </TouchableOpacity>
      );
    }

    return item.options.map((answer: string, answerIndex: number) => (
      <TouchableOpacity
        key={answerIndex}
        style={styles.answer}
        onPress={() => {
          if (item.isMultipleChoice) {
            handleMultipleChoiceSelect(questionIndex, answerIndex);
          } else {
            handleSingleChoiceSelect(questionIndex, answerIndex);
          }
        }}>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: selectedAnswers[questionIndex].has(answerIndex)
                ? '#F6AF24'
                : 'transparent',
            },
          ]}
        />
        <Text style={styles.answerText}>{answer}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icons.AntDesign name="arrowleft" size={25} color={'black'} />
        </TouchableOpacity>
        <Image source={gsbLogo} />
        <View style={{width: 25}} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}>
        <Text style={styles.title}>Diabetes</Text>

        {ServiceData.map((item, questionIndex) => (
          <View key={questionIndex} style={styles.questionContainer}>
            <Text style={styles.question}>{item.questionText}</Text>
            <View style={styles.answersContainer}>
              {renderQuestion(item, questionIndex)}
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.submitButton, {opacity: isFormComplete ? 1 : 0.5}]}
          disabled={!isFormComplete}>
          <Text style={styles.submitButtonText}>SUBMIT</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SecondForm;

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
    paddingHorizontal: 16,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    color: 'black',
    borderBottomWidth: 1,
    fontWeight: '500',
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 10,
    color: '#344054',
  },
  answersContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFA800',
    padding: 10,
  },
  answer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  answerText: {
    fontSize: 16,
    color: 'black',
  },
  answerTextInput: {
    borderBottomWidth: 1,
    borderColor: '#344054',
    color: 'black',
    fontSize: 16,
    flex: 1,
    marginTop: -20,
  },
  submitButton: {
    backgroundColor: '#F6AF24',
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
