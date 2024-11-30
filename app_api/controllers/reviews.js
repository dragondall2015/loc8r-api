const mongoose = require('mongoose');
const Loc = mongoose.model('Location');
const User = mongoose.model('User');

// const getAuthor = (req, res, callback) => {
//   if (req.auth && req.auth.email) {
//     User
//       .findOne({ email: req.auth.email })
//       .exec((err, user) => {
//         if (!user) {
//           return res.status(404).json({ "message": "User not found" });
//         } else if (err) {
//           console.log(err);
//           return res.status(404).json(err);
//         }
//         callback(req, res, user.name);
//       });
//   } else {
//     return res.status(404).json({ "message": "User not found" });
//   }
// };
const getAuthor = async (req, res) => {
  if (req.auth && req.auth.email) {
    try {
      // 이메일로 사용자 조회
      const user = await User.findOne({ email: req.auth.email }).exec();
      if (!user) {
        return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
      }
      return user.name; // 사용자 이름 반환
    } catch (err) {
      console.error(err);
      return res.status(400).json(err); // 오류 반환
    }
  } else {
    return res.status(404).json({ message: "인증 정보가 없습니다." });
  }
};


const doSetAverageRating = async (location) => {
  if (location.reviews && location.reviews.length > 0) {
    const count = location.reviews.length;
    const total = location.reviews.reduce((acc, {rating}) => {
      return acc + rating;
    }, 0);

    location.rating = parseInt(total / count, 10);
    try {
      await location.save();
      console.log(`Average rating updated to ${location.rating}`);
    } catch (err) {
      console.log(err);
    }
  }
};

// const doAddReview = (req, res, location, author) => {
//   if (!location) {
//     res
//       .status(404)
//       .json({ "message": "Location not found" });
//   } else {
//     const { rating, reviewText } = req.body;
//     location.reviews.push({
//       author,
//       rating,
//       reviewText
//     });
//     location.save((err, location) => {
//       if (err) {
//         return res
//           .status(400)
//           .json(err);
//       } else {
//         updateAverageRating(location._id);
//         const thisReview = location.reviews.slice(-1).pop();
//         res
//           .status(201)
//           .json(thisReview);
//       }
//     });
//   }
// };
const doAddReview = async (req, res, location) => {
  console.log("Received review data:", req.body);

  const { author, rating, reviewText } = req.body;

  if (!author || !reviewText || typeof rating !== 'number') {
    console.error("Invalid review data:", req.body);
    return res.status(400).json({ "message": "Invalid review data" });
  }

  const newReview = {
    author,
    rating,
    reviewText,
    _id: new mongoose.Types.ObjectId(),
    createdOn: new Date()
  };

  try {
    location.reviews.push(newReview);
    const savedLocation = await location.save();
    console.log("Review saved successfully:", savedLocation.reviews);
    updateAverageRating(savedLocation._id);
    const thisReview = savedLocation.reviews.slice(-1).pop();
    res.status(201).json(thisReview);
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(400).json(err);
  }
};

const updateAverageRating = async (locationId) => {
  try {
    const location = await Loc.findById(locationId).select('rating reviews').exec();
    if (location) {
      await doSetAverageRating(location);
    }
  } catch (err) {
    console.log(err);
  }
};

// const reviewsCreate = (req, res) => {
//   getAuthor(req, res, (req, res, userName) => {
//     const locationId = req.params.locationid;
//     if (locationId) {
//       Loc
//         .findById(locationId)
//         .select('reviews')
//         .exec((err, location) => {
//           if (err) {
//             res
//               .status(400)
//               .json(err);
//           } else {
//             doAddReview(req, res, location, userName);
//           }
//         });
//     } else {
//       res
//         .status(404)
//         .json({ "message": "Location not found" });
//     }
//   });
// };
const reviewsCreate = async (req, res) => {
  try {
    const userName = await getAuthor(req, res);
    if (!userName) {
      return; // getAuthor에서 이미 오류 처리
    }

    const locationId = req.params.locationid;
    if (!locationId) {
      return res.status(404).json({ message: "Location not found" });
    }

    const location = await Loc.findById(locationId).select("reviews").exec();
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    console.log("Received review data:", req.body); // 클라이언트로부터 받은 데이터 로그
    await doAddReview(req, res, location, userName);
  } catch (err) {
    console.error("Error in reviewsCreate:", err);
    return res.status(400).json(err);
  }
};



const reviewsReadOne = async (req, res) => {
  try {
    const location = await Loc.findById(req.params.locationid).select('name reviews').exec();
    if (!location) {
      return res.status(404).json({ "message": "location not found" });
    }

    if (location.reviews && location.reviews.length > 0) {
      const review = location.reviews.id(req.params.reviewid);
      if (!review) {
        return res.status(404).json({ "message": "review not found" });
      }

      const response = {
        location: {
          name: location.name,
          id: req.params.locationid
        },
        review
      };
      return res.status(200).json(response);
    } else {
      return res.status(404).json({ "message": "No reviews found" });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

const reviewsUpdateOne = async (req, res) => {
  if (!req.params.locationid || !req.params.reviewid) {
    return res.status(404).json({ "message": "Not found, locationid and reviewid are both required" });
  }

  try {
    const location = await Loc.findById(req.params.locationid).select('reviews').exec();
    if (!location) {
      return res.status(404).json({ "message": "Location not found" });
    }

    if (location.reviews && location.reviews.length > 0) {
      const thisReview = location.reviews.id(req.params.reviewid);
      if (!thisReview) {
        return res.status(404).json({ "message": "Review not found" });
      }

      thisReview.author = req.body.author;
      thisReview.rating = req.body.rating;
      thisReview.reviewText = req.body.reviewText;

      const updatedLocation = await location.save();
      await updateAverageRating(updatedLocation._id);
      return res.status(200).json(thisReview);
    } else {
      return res.status(404).json({ "message": "No review to update" });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

const reviewsDeleteOne = async (req, res) => {
  const { locationid, reviewid } = req.params;
  if (!locationid || !reviewid) {
    return res.status(404).json({ 'message': 'Not found, locationid and reviewid are both required' });
  }

  try {
    const location = await Loc.findById(locationid).select('reviews').exec();
    if (!location) {
      return res.status(404).json({ 'message': 'Location not found' });
    }

    if (location.reviews && location.reviews.length > 0) {
      const review = location.reviews.id(reviewid);
      if (!review) {
        return res.status(404).json({ 'message': 'Review not found' });
      }

      // review.remove();
      review.deleteOne();
      await location.save();
      await updateAverageRating(location._id);
      return res.status(204).json(null);
    } else {
      return res.status(404).json({ 'message': 'No Review to delete' });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

module.exports = {
  reviewsCreate,
  reviewsReadOne,
  reviewsUpdateOne,
  reviewsDeleteOne
};
