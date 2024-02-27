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
        unique: [true, "Product Name Already Exists"]
    },
    quantity: {
        required: [true, "Required Field"],
        type: String
    },
    rating: {
        required: [true, "Required Field"],
        type: [Number],
        validate:{
            validator: function(value){
                return value>=1 && value<=5;
            },
            message:"Rating Should be between 1 to 5"
        },
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


//! Virtual Properties
productSchema.virtual("discountPercentage").get(function () {
    return Math.round(((this.originalPrice - this.currentPrice) / this.originalPrice) * 100);
});

productSchema.pre('save', function(next) {
    this.productAdded = new Date();
    next();
});
productSchema.post('save', function(document, next){
    let data = `Product Saved at ${new Date()}. Product Name - ${document.productName} through DOCUMENT MIDDLEWARE`;
    let filePath = path.join(__dirname,'./../logs/product.txt' )
    fs.writeFileSync(filePath, data, { flag: 'a' }, (error) => {
        let errorData = `Error Occurred at ${new Date()}. While Saving Product. Error is ${error}`;
        fs.writeFileSync(filePath, errorData, { flag: 'a' });
    });
    next();
});

//! Query Middleware
// productSchema.pre(/^find/, function(next){
//     this.find({ Stock: {$gt: 0} });
//     this.startTime = Date.now();
//     next();
// });

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

productSchema.pre('aggregate', function(next){
    this.pipeline().unshift( { $match: { Stock: {$gt: 0}}})
    next();
});

module.exports = mongoose.model('Product', productSchema);