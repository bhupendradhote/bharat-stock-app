import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AgreementCheckboxProps {
  isChecked: boolean;
  onToggle: (checked: boolean) => void;
}

export default function AgreementCheckbox({ isChecked, onToggle }: AgreementCheckboxProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={() => onToggle(!isChecked)}
    >
      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
        {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
      </View>
      <Text style={styles.text}>
        I agree to the <Text style={styles.link}>Terms & Conditions</Text> and{' '}
        <Text style={styles.link}>Privacy Policy</Text>.
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#6B7280',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#005BC1',
    borderColor: '#005BC1',
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  link: {
    color: '#005BC1',
    fontWeight: '600',
  },
});