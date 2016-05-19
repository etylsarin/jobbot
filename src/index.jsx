require('../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('./css/chat.css');
var botRequestJSON = require("json!./botRequest.json");
var talk = require('speech-synthesis');

import React from 'react';
import ReactDOM from 'react-dom';

function parseUrl(text = '') {
  var urlRegex = /(https?:\/\/[^\s]+)/g,
    urlArray = [],
    matchArray;

  // Iterate through any URLs in the text.
  while( (matchArray = urlRegex.exec( text )) !== null ) {
      var token = matchArray[0];
      urlArray.push(token);
  }
  return {
    text: text.replace(urlRegex, ''),
    url: urlArray[0]
  }
}

function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);
    xhr.withCredentials = true;

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  console.log('XHR', xhr, "withCredentials" in xhr);
  return xhr;
}

var ChatMessage = React.createClass({
  render: function() {
    return <li className="media">
        <div className="media-body">
            <div className="media">
                <div className="pull-left" href="#">
                    <img className="media-object img-circle" src={this.props.avatar} />
                </div>
                <div className="media-body">
                    <p>{this.props.message}</p>
                    <footer className="small text-muted">{this.props.name} | {this.props.date}</footer>
                </div>
            </div>
        </div>
        <hr />
    </li>;
  }
});

var Chat = React.createClass({
  getInitialState: function() {
    return {
      text: '',
      messages: [],
      iframeUrl: 'http://www.monster.com',
      voiceControl: false
    };
  },

  newMessage: function(text, user) {
    var timestamp = new Date().toLocaleString(),
      msg = <ChatMessage message={text} date={timestamp} name={user.name} avatar={user.avatar} />;
    this.setState({
      messages: this.state.messages.concat([msg])
    });
  },

  submit: function(ev) {
    var self = this,
      xhr = createCORSRequest('POST', 'http://uxwiki.monster.com:3978/api/message', this.state.text);

    ev.preventDefault();
    this.newMessage(this.state.text, {
      name: 'Unknown user',
      avatar: 'user.png'
    });
    xhr.onreadystatechange = function () {
      var response;
      if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
        response = JSON.parse(xhr.responseText);
        console.log('json response', response);
        self.newMessage(response.message, {
          name: 'Job Bot',
          avatar: 'bot.jpg'
        });
        self.setState({
          //iframeUrl: msgObj.url || self.state.iframeUrl
        });
        if (self.state.voiceControl) {
          talk(response.message, 'Google UK English Male');
        }
      }
  };
    botRequestJSON.text = this.state.text;
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(botRequestJSON));
  },

  updateInput: function(ev) {
    this.setState({
      text: ev.target.value
    });
  },

  toggleVoiceControl: function(ev) {
    this.setState({
      voiceControl: ev.target.checked
    });
  },

  render: function() {
    return <div className="pageWrapper">
      <iframe src={this.state.iframeUrl}></iframe>
      <div className="chat">
        <div className="panel panel-info">
          <div className="panel-heading">Recent chat history</div>
          <div className="panel-body">
            <ul className="media-list">{this.state.messages}</ul>
          </div>
          <div className="panel-footer">
              <form onSubmit={this.submit}>
                  <div className="input-group">
                    <input onChange={this.updateInput} type="text" className="form-control" placeholder="Your Message" />
                    <span className="input-group-btn">
                        <button className="btn btn-info" type="submit">Send</button>
                    </span>
                  </div>
                  <input id="voiceControl" onChange={this.toggleVoiceControl} type="checkbox" className="hidden" />
                  <label htmlFor="voiceControl" className="microphone"><span className="sr-only">Use voice control</span></label>
              </form>
          </div>
        </div>
      </div>
    </div>;
  }
});

ReactDOM.render(<Chat/>, document.getElementById("app"));
