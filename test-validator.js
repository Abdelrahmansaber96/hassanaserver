// Direct test without network calls
const express = require('express');
const authRoutes = require('./src/routes/authRoutes');
const { simpleCustomerValidator } = require('./src/validators');

console.log('Testing validator directly...');

const testData = {
    name: "تجربة",
    phone: "0501111111"
};

const { error } = simpleCustomerValidator.validate(testData);

if (error) {
    console.log('Validation Error:', error.details);
} else {
    console.log('Validation Success!');
    console.log('Test data:', testData);
}

// Test with animal type
const testDataWithAnimal = {
    name: "أحمد التجريبي",
    phone: "0501111111",
    animalType: "إبل",
    notes: "عميل تجريبي للاختبار"
};

const { error: error2 } = simpleCustomerValidator.validate(testDataWithAnimal);

if (error2) {
    console.log('Validation Error with animal:', error2.details);
} else {
    console.log('Validation Success with animal!');
    console.log('Test data with animal:', testDataWithAnimal);
}