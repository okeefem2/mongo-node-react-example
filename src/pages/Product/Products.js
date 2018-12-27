import React, { Component } from 'react';
import { Stitch, RemoteMongoClient } from 'mongodb-stitch-browser-sdk';

import Products from '../../components/Products/Products';
import BSON from 'bson';

class ProductsPage extends Component {
  state = { isLoading: true, products: [] };
  componentDidMount() {
    this.fetchData();
  }

  productDeleteHandler = productId => {

    const mongoDb = Stitch.defaultAppClient.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas');

    mongoDb.db('shop').collection('products').deleteOne({ _id: new BSON.ObjectID(productId) })
      .then(result => {
        console.log(result);
        this.fetchData();
      })
      .catch(err => {
        this.props.onError('Deleting product failed. Please try again later');
        console.log(err);
      });
  };

  fetchData = () => {
    const mongoDb = Stitch.defaultAppClient.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas');

    mongoDb.db('shop').collection('products').find().asArray()
      .then(productDocs => {
        productDocs = productDocs.map(productDoc => {
          productDoc._id = productDoc._id.toString();
          productDoc.price = productDoc.price.toString();
          return productDoc;
        });
        this.setState({ isLoading: false, products: productDocs });
      })
      .catch(err => {
        this.setState({ isLoading: false, products: [] });
        this.props.onError('Loading products failed. Please try again later');
        console.log(err);
      });
  };

  render() {
    let content = <p>Loading products...</p>;

    if (!this.state.isLoading && this.state.products.length > 0) {
      content = (
        <Products
          products={this.state.products}
          onDeleteProduct={this.productDeleteHandler}
        />
      );
    }
    if (!this.state.isLoading && this.state.products.length === 0) {
      content = <p>Found no products. Try again later.</p>;
    }
    return <main>{content}</main>;
  }
}

export default ProductsPage;
