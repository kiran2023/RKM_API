const fs = require('fs');

const productUrl = './Datas/products.json';
const globalAsyncErrorHandler = require('../utils/globalAsyncErrorHandler');
const customError = require('../utils/customError');

const mongoose =  require('mongoose');
const productSchema = require('../models/product');

const priceFilterHighToLow = (request, response, next) => {
    request.query.sort = '-currentPrice';
    next();
}

const priceFilterLowToHigh = (request, response, next) => {
    request.query.sort = 'currentPrice';
    next();
}

const getAllProducts = globalAsyncErrorHandler (async (request, response) => {
        let queryStr = JSON.stringify(request.query);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

        let queryObj = JSON.parse(queryStr);
        let sortDatas={}, selectData={};

        if (queryObj.hasOwnProperty('sort')) {
            sortDatas = request.query.sort;
            delete queryObj.sort;
        }
        if (queryObj.hasOwnProperty('select')) {
            selectData = request.query.select;
            delete queryObj.select;
        }
        if (queryObj.hasOwnProperty('page')||queryObj.hasOwnProperty('limit')) {
            delete queryObj.page;
            delete queryObj.limit;
        }
        let product = productSchema.find(queryObj);
        if (JSON.stringify(sortDatas) !== '{}') {
            let sortData = sortDatas.replaceAll(","," ");
            product = product.sort(sortData);
        }
        if (JSON.stringify(selectData) !== '{}') {
            let data = selectData.replaceAll(","," ");
            product = product.select(data);
        }

        let page = request.query.page*1||1;
        let limit = request.query.limit*1||30;
        
        let displayProductsPerPage = (page-1) * limit;
        
        product = product.skip(displayProductsPerPage).limit(limit);
        let finalProduct = await product;

        response.status(200).json({
            status: "success",
            "Number Of Products": finalProduct.length,
            productInfo: {
                finalProduct
            }
        });
});

const getSpecificProduct = globalAsyncErrorHandler(async (request, response, next) => {
    let id = request.params.id;
    id = id.replace('\n', '');
        const product = await productSchema.findById(id);

        response.status(200).json({
            status: "success",
            productInfo: {
                product
            }
        })
});

const addProduct = globalAsyncErrorHandler (async (request, response) => {
    const product = await productSchema.create(request.body);

    response.status(201).json({
        status: "success",
        productInfo: {
            product
        }
    });
});

const patchProductData = globalAsyncErrorHandler (async (request, response) => {
    let id = request.params.id;
    id = id.replace('\n', '');
        const product = await productSchema.findByIdAndUpdate(id, request.body, { new: true, runValidators: true });

        response.status(200).json({
            status: "success",
            productInfo: {
                product
            }
        });
});

const deleteProduct = globalAsyncErrorHandler(async (request, response) => {
    let id = request.params.id;
    id = id.replace('\n', '');
    await productSchema.findByIdAndDelete(id);
    response.status(204).json({
            status: "success",
            data: null
        });
});

const categoryFiltration = globalAsyncErrorHandler(async (request, response) => {
        let categoryName = request.params.category;

        let categoryProduct = await productSchema.aggregate([
            {$match: { category: categoryName } },
            {$sort: {"productName":1 }},
            { $group: {
                _id: categoryName,
                products:{ $push: '$productName' },
                productTotalCost: { $sum: '$originalAmount' }
            } },
            {$addFields: { category: '$_id' }},
            {$project: { _id:0 }},
        ])

        response.status(200).json({
            status: "success",
            productInfo: {
                categoryProduct
            }
        });
});

module.exports = { getAllProducts, getSpecificProduct, addProduct, patchProductData, deleteProduct, priceFilterHighToLow, priceFilterLowToHigh, categoryFiltration }
