const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      maxlength: [
        30,
        'A product name must have less or equal then 30 characters'
      ]
    },
    slug: String,
    price: {
      type: Number,
      required: [true, 'A product must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A product must have a description']
    },
    productTag: {
      type: String,
      required: [true, 'A product must have a tag atleast'],
      enum: {
        values: ['bio-degradable', 'Recycled', 'lower-carbon-footprint'],
        message: 'productTag is : bio-degradable, recylced etc.'
      }
    },
    catagory: {
      type: String,
      required: [true, 'A product must have a Product Catagory'],
      enum: {
        values: ['zeroWaste', 'art', 'womanCare'],
        message: 'productTag is : art, womanCare etc'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    imageCover: {
      type: String
    },
    images: [String],
    listedOn: {
      type: Date,
      default: Date.now(),
      select: false
    },
    seller: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//Indexing for better anf faster reading
productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });

//virtual populate
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
productSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
productSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'seller',
    select: '-__v -passwordChangedAt'
  });

  next();
});

productSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
