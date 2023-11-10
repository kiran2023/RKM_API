const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const productSchema = new mongoose.Schema({
    Stock: {
        required: [true, "Required Field"],
        type: Number
    },
    packed: {
        type: String
    },
    category: {
        required: [true, "Required Field"],
        type: String,
        enum: {
            values: ["grocery", "beverages", "household"],
            message: "Category {VALUE} is not available for selection"
        }
    },
    uniqueId: {
        required: [true, "Required Field"],
        type: Number
    },
    filterValue: {
        required: [true, "Required Field"],
        type: Number
    },
    value: {
        required: [true, "Required Field"],
        type: Number
    },
    image: {
        required: [true, "Required Field"],
        type: String
    },
    alt: {
        required: [true, "Required Field"],
        type: String
    },
    title: {
        required: [true, "Required Field"],
        type: String
    },
    productName: {
        required: [true, "Required Field"],
        type: String,
        unique: true
    },
    quantity: {
        required: [true, "Required Field"],
        type: String
    },
    rating: {
        required: [true, "Required Field"],
        type: [Number],
        // min:[1, "Rating Should be a Minimum of 1"],
        // max:[5, "Rating Should not Exceed 5"],
        validate:{
            validator: function(value){
                return value>=1 && value<=5;
            },
            message:"Rating Should be between 1 to 5"
        },
        // select: false
    },
    ratingAverage: {
        required: [true, "Required Field"],
        type: Number
    },
    originalPrice: {
        required: [true, "Required Field"],
        type: Number
    },
    currentPrice: {
        required: [true, "Required Field"],
        type: Number,
        // select: false //? Hides from the user
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


//! Virtuals
productSchema.virtual("discountPercentage").get(function () {
    return Math.round(((this.originalPrice - this.currentPrice) / this.currentPrice) * 100);
});

//! Document Middleware -- Multipe Pre, post can be called --> save() or create() --> insertMany or findByIdAndUpdate it does not work.
productSchema.pre('save', function(next) {
    this.productAdded = new Date();
    next();
});
productSchema.post('save', function(document, next){
    let data = `Product Saved at ${new Date()}. Product Name - ${document.productName} through DOCUMENT MIDDLEWARE`;
    let filePath = path.join(__dirname,'./../logs/product.txt' )
    fs.writeFileSync(filePath, data, { flag: 'a' }, (error) => {
        let errorData = `Error Occured at ${new Date()}. While Saving Product. Error is ${error}`;
        fs.writeFileSync(filePath, errorData, { flag: 'a' });
    });
    next();
});

//! Query Middleware
productSchema.pre(/^find/, function(next){
    this.find({ Stock: {$gt: 0} });
    this.startTime = Date.now();
    next();
});

productSchema.post(/^find/, function(document, next){
    this.endTime = Date.now();
    let data = `\nProduct Fetched through QUERY MIDDLEWARE at ${new Date()} in ${ this.endTime - this.startTime  } Milliseconds`;
    let filePath = path.join(__dirname,'./../logs/product.txt' )
    fs.writeFileSync(filePath, data, { flag: 'a' }, (error) => {
        let errorData = `Error Occured at ${new Date()}. While Saving Product. Error is ${error}`;
        fs.writeFileSync(filePath, errorData, { flag: 'a' });
    });
    next();
});

//! Aggregation Middleware

productSchema.pre('aggregate', function(next){
    this.pipeline().unshift({ Stock: {$gt: 0}})
    next();
});

// productSchema.post(/^find/, function(next){
//     this.find({ Stock: {$gt: 75} });
//     next();
// });

// const schemaData = mongoose.model('Product', productSchema);

// const testData = new schemaData(    {
//  Stock: 87,
//  category: "groceries",
//  packed: "June 3, 2023",
//  uniqueId: "5",
//  filterValue: "2",
//  classData: " p-btn--2 p-btn--14 p-btn--27 p-btn--28 p-btn--30 p-btn--31",
//  value: "10",
//  image: "assets/images/VeggetablesFruits/bananaNendran.png",
//  alt: "Fresh Groceries",
//  title: "Banana Nendran",
//  productName: "Banana Nendran 4 pcs (Box)",
//  quantity: "800g - 1200g (Approx)",
//  rating: [
//         3,
//         3
//     ],
//  ratingAverage: 3,
//  originalAmount: "129",
//  discounted: "149",
//  actualAmount: "129"
// });

// testData.save();

module.exports = mongoose.model('Product', productSchema);