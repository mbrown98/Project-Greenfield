import React from "react";
import QuestionsContainer from "./MasterQAContainer/QuestionsContainer.jsx";
import SearchBar from "./SearchBar.jsx";
import Container from "react-bootstrap/Container";
import { setNewNumOfQuestions } from "../Redux/ActionCreators.js";
import QandAModalButton from "./Modals/QandAModalButton.jsx";
import { connect } from "react-redux";
import Button from "react-bootstrap/Button";
import { getQuestionsThunk } from "../Redux/ThunkMiddleware.js";

const mapDispatchToProps = dispatch => {
  return {
    setNewNumOfQuestions: number => dispatch(setNewNumOfQuestions(number)),
    getQuestionsThunk: id => dispatch(getQuestionsThunk(id))
  };
};

const mapStateToProps = state => ({
  questionSet: state.questionSet,
  numOfQuestions: state.numOfQuestions,
  selectedProduct: state.selectedProduct
});

class QuestionAnswers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      style: {
        height: `250px`,
        overflowY: "scroll"
      },
      searchParams: "",
      filteredQuestions: [],
      searched: false
    };
    this.searchHandler = this.searchHandler.bind(this);
  }

  searchHandler(event) {
    let params = event.target.value.toLowerCase();
    if (params.length >= 3) {
      let filteredArr = this.props.questionSet.reduce((acc, question) => {
        let questionBody = question.question_body.toLowerCase();
        if (questionBody.indexOf(params) !== -1) {
          acc.push(question);
        }
        return acc;
      }, []);
      this.setState(
        { filteredQuestions: filteredArr, searched: true },
        () => {}
      );
    }
    if (params.length < 3 && this.state.searched === true) {
      this.setState({ filteredQuestions: [], searched: false });
    }
  }

  componentDidMount() {
    let productId = this.props.productId || 3;
    this.props.getQuestionsThunk(productId);
  }

  clickHandler() {
    let newNumOfQuestions = this.props.numOfQuestions + 2;
    newNumOfQuestions =
      newNumOfQuestions > this.props.questionSet.length
        ? this.props.questionSet.length
        : newNumOfQuestions;

    this.props.setNewNumOfQuestions(newNumOfQuestions);
    //set new style on expand
    let styles = {
      maxHeight: `${window.innerHeight * 0.8}px`,
      overflowY: "scroll"
    };
    this.setState({ style: styles });
  }

  render() {
    let button =
      this.props.numOfQuestions === this.props.questionSet.length ||
      this.props.questionSet.length < 2 ? null : (
        <Button className="QnAButton" onClick={() => this.clickHandler()}>
          More Answered Questions
        </Button>
      );
    let QnAContainer =
      this.props.questionSet.length > 0 ? (
        <Container>
          <SearchBar handler={this.searchHandler} />
          <div className="scrollable" style={this.state.style}>
            <Container>
              {" "}
              <QuestionsContainer
                searched={this.state.searched}
                filteredQuestions={this.state.filteredQuestions}
              />
            </Container>
          </div>
          {button}
          <QandAModalButton type="question" />
        </Container>
      ) : (
        <div>
          <h2>Questions & Answers</h2>{" "}
          <Container>
            {button}
            <QandAModalButton type="question" />
          </Container>
        </div>
      );
    return <div className="masterQnAContaier">{QnAContainer}</div>;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(QuestionAnswers);
