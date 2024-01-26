const globalAsyncErrorHandler = require("../utils/globalAsyncErrorHandler");
const productSchema = require("../models/product");

const priceFilterHighToLow = (request, response, next) => {
  request.query.sort = "-currentPrice";
  next();
};

const priceFilterLowToHigh = (request, response, next) => {
  request.query.sort = "currentPrice";
  next();
};

const getAllProducts = async (request, response) => {
  try {
    let queryStr = JSON.stringify(request.query);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    let queryObj = JSON.parse(queryStr);
    let sortData = {};
    let selectData = {};

    if (queryObj.hasOwnProperty("sort")) {
      sortData = request.query.sort;
      delete queryObj.sort;
    }
    if (queryObj.hasOwnProperty("select")) {
      selectData = request.query.select;
      delete queryObj.select;
    }
    if (queryObj.hasOwnProperty("page") || queryObj.hasOwnProperty("limit")) {
      delete queryObj.page;
      delete queryObj.limit;
    }

    let product = productSchema.find(queryObj);

    if (Object.keys(sortData).length > 0) {
      let sorted = sortData.replace(",", " ");
      product = product.sort(sorted);
    }
    if (Object.keys(selectData).length > 0) {
      let data = selectData.replaceAll(",", " ");
      product = product.select(data);
    }

    let page = request.query.page * 1 || 1;
    let limit = request.query.limit * 1 || 5;
    let displayProductsPerPage = (page - 1) * limit;

    product = product.skip(displayProductsPerPage).limit(limit);
    let finalProduct = await product;

    response.status(200).json({
      status: "success",
      "Number Of Products": finalProduct.length,
      productInfo: {
        finalProduct,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

const getSpecificProduct = globalAsyncErrorHandler(
  async (request, response, next) => {
    let id = request.params.id;
    id = id.replace("\n", "");
    const product = await productSchema.findById(id);

    response.status(200).json({
      status: "success",
      productInfo: {
        product,
      },
    });
  }
);

const addProduct = async (request, response) => {
  const product = productSchema
    .create(request.body)
    .then((data) => {
      response.status(201).json({
        status: "success",
        productInfo: {
          data,
        },
      });
    })
    .catch((error) => {
      response.status(404).json({
        status: "fail",
        message: `Error - ${error}`,
      });
    });
  if (!product) {
    return next(new customError("Product Not Created", 404));
  }
};

const patchProductData = globalAsyncErrorHandler(async (request, response) => {
  let id = request.params.id;
  id = id.replace("\n", "");
  const product = await productSchema.findByIdAndUpdate(id, request.body, {
    new: true,
    runValidators: true,
  });

  response.status(200).json({
    status: "success",
    productInfo: {
      product,
    },
  });
});

const deleteProduct = globalAsyncErrorHandler(async (request, response) => {
  let id = request.params.id;
  id = id.replace("\n", "");
  await productSchema.findByIdAndDelete(id);
  response.status(204).json({
    status: "success",
    data: null,
    message: `Product with ID - ${id} Deleted Successfully`,
  });
});

const categoryFiltration = globalAsyncErrorHandler(
  async (request, response) => {
    let categoryName = request.params.category;

    let categoryProduct = await productSchema.aggregate([
      { $match: { category: categoryName } },
      { $sort: { productName: 1 } },
      //* {$match: {"ratingAverage":{ $gte: 2} }},
      {
        $group: {
          _id: categoryName,
          products: { $push: "$productName" },
          productTotalCost: { $sum: "$originalPrice" },
        },
      },
      { $addFields: { category: "$_id" } },
      { $project: { _id: 0 } },
    ]);

    response.status(200).json({
      status: "success",
      productInfo: {
        categoryProduct,
      },
    });
  }
);

module.exports = {
  getAllProducts,
  getSpecificProduct,
  addProduct,
  patchProductData,
  deleteProduct,
  priceFilterHighToLow,
  priceFilterLowToHigh,
  categoryFiltration,
};
