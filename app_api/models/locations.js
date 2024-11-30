const mongoose = require('mongoose');

const openingTimesSchema = new mongoose.Schema({
  days: {
    type: String,
    required: true
  },
  opening: String,
  closing: String,
  closed: {
    type: Boolean,
    required: true
  }
});

const reviewSchema = new mongoose.Schema({
  author: {
      type: String,
      required: true
  },
  rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5
  },
  reviewText: {
      type: String,
      required: true
  },
  createdOn: {
      type: Date,
      'default': Date.now
  },
  _id: { // _id를 명시적으로 추가하여 자동 생성
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
}
});


const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: String,
  rating: {
    type: Number,
    'default': 1,
    min: 1,
    max: 5
  },
  facilities: [String],
  coords: {
    type: { type: String},
    index: [Number]

  },
  openingTimes: [openingTimesSchema],
  reviews: [reviewSchema]
});

locationSchema.index({coords: '2dsphere'});

mongoose.model('Location', locationSchema);