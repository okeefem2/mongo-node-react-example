
import React, { Component } from 'react';
import { Stitch, RemoteMongoClient } from 'mongodb-stitch-browser-sdk';
import BSON from 'bson';

import './Product.css';

class ProductPage extends Component {
  state = { isLoading: true, product: null };

  componentDidMount() {
    const mongoDb = Stitch.defaultAppClient.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas');

    mongoDb.db('shop').collection('products')
    .find({ _id: new BSON.ObjectID(this.props.match.params.id) })
    .asArray()
      .then(productDocs => {
        const productDoc = productDocs[0];
        productDoc.price = productDoc.price.toString();
        productDoc._id = productDoc._id.toString();
        this.setState({ isLoading: false, product: productDocs[0] });
      })
      .catch(err => {
        this.setState({ isLoading: false });
        console.log(err);
        this.props.onError('Loading the product failed. Please try again later');
      });
  }

  render() {
    let content = <p>Is loading...</p>;

    if (!this.state.isLoading && this.state.product) {
      content = (
        <main className="product-page">
          <h1>{this.state.product.name}</h1>
          <h2>{this.state.product.price}</h2>
          <div
            className="product-page__image"
            style={{
              backgroundImage: "url('" + this.state.product.image + "')"
            }}
          />
          <p>{this.state.product.description}</p>
        </main>
      );
    }
    if (!this.state.isLoading && !this.state.product) {
      content = (
        <main>
          <p>Found no product. Try again later.</p>
        </main>
      );
    }
    return content;
  }
}

export default ProductPage;
