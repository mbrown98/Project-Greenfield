import React from "react";
import axios from "axios";

// React Component imports
import ProductCard from "./ProductCard";
import ComparisonModal from './ComparisonModal'
import OutfitCard from './OutfitCard'

// Bootstrap imports
import CardDeck from "react-bootstrap/CardDeck";
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
// import Carousel from "react-bootstrap/Carousel";

// Redux imports
import {getNewProductThunk} from '../Redux/ThunkMiddleware.js'
import { connect } from 'react-redux'

const mapDispatchToProps = dispatch => {
  return {
    getNewProductThunk: id => dispatch(getNewProductThunk(id))
  };
};

const mapStateToProps = state => ({
  selectedProduct: state.selectedProduct
});

class RelatedProducts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      current: {},
      compare: {},
      relatedProducts: [],
      productInfo: {},
      outfitId: [],
      outfitNames: [],
      outfitInfo:{},
      outfitLoaded: false,
      clickedProduct: null,
      showModal: false
    }; 
    this.handleCompare = this.handleCompare.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleAddToOutfit = this.handleAddToOutfit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  handleClick(e) {
    let id = e.currentTarget.className.split(' ')[1]
    // should update store with the clicked e target value id
    this.props.getNewProductThunk(id)
  }

  handleCompare(e) {
    this.setState({showModal: true})
    axios.get(`http://3.134.102.30/products/${e.target.value}`)
    .then( ({data}) => {
      this.setState({compare:data})
    })
  }

  getCurrentFromStore(){

  }


  componentDidMount() {
    let productId = 4
    console.log('selected product', this.props.selectedProduct)
    this.props.getNewProductThunk(productId)
    this.getOutfits();
    axios.get(`http://3.134.102.30/products/${productId}`).then( ({data}) => {
      this.setState({current: data})
    })
    axios.get(`http://3.134.102.30/products/${productId}/related`).then(({ data }) => {
      let productInfo={};
      let relatedProducts = [];

      async function getData() {
        for (let id of data) {
        await axios.get(`http://3.134.102.30/products/${id}`).then( ({data}) => {
          relatedProducts.push(data)
        } )
        await axios.get(`http://3.134.102.30/products/${id}/styles`).then( ({data}) => {
          productInfo[data.product_id] = data.results
        })
      }}
      getData().then( () => {
        this.setState({productInfo: productInfo})
        this.setState({relatedProducts: relatedProducts})
      });

    });

    
  }

  handleAddToOutfit(){
    
    let currentOutfit = this.state.outfitId.slice();
    if (currentOutfit.indexOf(this.state.current.id) === -1){
      this.setState({outfitLoaded: false})
      currentOutfit.push(this.state.current.id)
    }
    this.setState({outfitId: currentOutfit}, () => {
      localStorage.setItem('outfit', JSON.stringify(currentOutfit))
      this.getOutfits()
    })
  }

  getOutfits(){
    // retrieves the favorites from the local storage
    let outfitId = JSON.parse(localStorage.getItem('outfit'))
    if (!!outfitId){
      this.setState({outfitId: outfitId}, () => {
        let outfitNames = []
        let outfitInfo = {}
        async function getData() {
          for (let id of outfitId) {
          await axios.get(`http://3.134.102.30/products/${id}`).then( ({data}) => {
            outfitNames.push(data)
          } )
          await axios.get(`http://3.134.102.30/products/${id}/styles`).then( ({data}) => {
            outfitInfo[data.product_id] = data.results
          })
        }}
        getData().then( () => {
          this.setState({outfitNames: outfitNames})
          this.setState({outfitInfo: outfitInfo})
          this.setState({outfitLoaded: true})
        }
        )
      }) 
    }
  }

  handleDelete(e) {
    let id = Number(e.target.value)
    let storage = this.state.outfitId.slice()
    let index = storage.indexOf(id)
    storage.splice(index, 1)
    localStorage.setItem('outfit', JSON.stringify(storage))
    this.getOutfits();
  }

  render() {
    return (
      <div>
        <h2 align='left'>Related Products</h2>
        {/* <Carousel
          autoPlay={false}
          data-interval={false}
          id="relatedCarousel"
        >   */}
        {this.state.showModal ? 
        <ComparisonModal 
          product={this.state.current}
          compare={this.state.compare}
          show={this.state.showModal}
          onHide={() => {this.setState({showModal: false})}}
        /> : <div></div>}
          <CardDeck>  

            {this.state.relatedProducts.map( (product,i) => {      
              return (
                    <ProductCard 
                      key={i}
                      index={i}
                      handleClick={this.handleClick}
                      handleCompare={this.handleCompare}
                      productInfo={this.state.productInfo} 
                      product={product}
                    /> 
              )
            })}
          </CardDeck>
   
        {/* </Carousel> */}
        <h2> Your Outfit </h2>
          <CardDeck>  
            {/* add an outfit card here */}
            <Card
              style={{ width: '18rem' }}
            >
              <Button  
                    id = "addButton"
                    variant="outline-primary"
                    onClick={this.handleAddToOutfit}
                    >
                    +
              </Button>{' '}
            </Card>
            {/* map out the rest of the favorites after pulling favorites */}
            {this.state.outfitId.map( (outfitId,i) => { 
              if(this.state.outfitLoaded){
                return (
                      <OutfitCard 
                        key={i}
                        index={i}
                        outfitId={outfitId}
                        outfitNames={this.state.outfitNames}
                        outfitInfo={this.state.outfitInfo}
                        handleDelete={this.handleDelete}
                      /> 
                
                )
              }     
            })}
          </CardDeck>
        <br></br>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RelatedProducts);