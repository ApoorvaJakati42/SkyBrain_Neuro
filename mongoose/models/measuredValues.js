const mongoose = require('mongoose');

const measuredSchema = new mongoose.Schema({
    xValues: Array,
    yValues: Array,
    stressValues : Array ,
    focusValues : Array ,
    angerValues : Array ,
    selfValues : Array,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MeasuredValues', measuredSchema);