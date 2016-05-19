require("../node_modules/bootstrap/dist/css/bootstrap.min.css")
import React from 'react';
import ReactDOM from 'react-dom';

var ChatMessage = React.createClass({
  render: function() {
    return <p>{this.props.message}</p>;
  }
});

var Chat = React.createClass({
  getInitialState: function() {
    return {
      text: '',
      messages: []
    };
  },

  submit: function(ev) {
    ev.preventDefault();

    var newMessage = <ChatMessage message={this.state.text} />;

    this.setState({
      messages: this.state.messages.concat([newMessage])
    });
  },

  updateInput: function(ev) {
    this.setState({
      text: ev.target.value
    });
  },

  render: function() {
    return <div>
      <div>{this.state.messages}</div>
      <form onSubmit={this.submit}>
        <input onChange={this.updateInput} type="text" placeholder="Your message" />
        <input type="submit" value="Send" />
      </form>
    </div>;
  }
});

ReactDOM.render(<Chat/>, document.getElementById("chat"));
