require('../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('./css/chat.css');

import React from 'react';
import ReactDOM from 'react-dom';

var botRequestJSON = require("json!./botRequest.json");
var talk = require('speech-synthesis');
var Speech = require('speechjs');

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
      msg = <ChatMessage key={this.state.messages.length} message={text} date={timestamp} name={user.name} avatar={user.avatar} />;
    this.setState({
      messages: this.state.messages.concat([msg])
    });
  },

  speechRecognition: function() {
    var self = this,
      recognizer = new Speech({});

    recognizer
        .on('start', function () {
            console.log('started')
        })
        .on('end', function () {
            console.log('ended')
        })
        .on('error', function (event) {
            console.log(event.error)
        })
        .on('interimResult', function (msg) {
            document.getElementById("chatInput").value = msg;
        })
        .on('finalResult', function (msg) {
            var submitEvent = new Event('submit');
            document.getElementById("chatInput").value = msg;
            document.getElementById("voiceControl").checked = false;
            self.setState({
              text: msg,
              voiceControl: false
            });
            window.setTimeout(function() {
              document.getElementById("chatForm").dispatchEvent(submitEvent);
            }, 500);
        });

      return recognizer;
  },

  submit: function(ev) {
    var self = this,
      xhr = createCORSRequest('POST', 'http://uxwiki.monster.com:3978/api/messages', this.state.text);

    ev.preventDefault();
    this.newMessage(this.state.text, {
      name: 'Unknown user',
      avatar: 'user.png'
    });
    xhr.onreadystatechange = function () {
      var response;
      if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 400) {
        response = JSON.parse(xhr.responseText);
        self.newMessage(response.text, {
          name: 'Job Bot',
          avatar: 'bot.jpg'
        });
        self.setState({
          //iframeUrl: msgObj.url || self.state.iframeUrl
        });
        talk(response.text, 'Google UK English Male');
      }
    };
    botRequestJSON.text = this.state.text;
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader("Authorization", "Basic TW9uc3RlckpvYlNlYXJjaEJvdDp4eGE=");
    xhr.send(JSON.stringify(botRequestJSON));
    document.getElementById("chatInput").value = '';
  },

  updateInput: function(ev) {
    this.setState({
      text: ev.target.value
    });
  },

  toggleVoiceControl: function(ev) {
    if (ev.target.checked) {
      this.recognizer = this.speechRecognition();
      this.recognizer.start();
    } else {
      this.recognizer.stop();
    }
    this.setState({
      voiceControl: ev.target.checked
    });
  },

  render: function() {
    return <div className="pageWrapper">
      <iframe src={this.state.iframeUrl}></iframe>
      <input id="monster" type="checkbox" className="hidden" />
      <label htmlFor="monster" className="monster"><span className="sr-only">Show chat</span></label>
      <div className="chat">
        <div className="panel panel-info">
        <div className="panel-heading">Recent chat history</div>
          <div className="panel-body">
            <ul className="media-list">{this.state.messages}</ul>
          </div>
          <div className="panel-footer">
            <form id="chatForm" onSubmit={this.submit}>
              <div className="input-group">
                <input id="chatInput" onChange={this.updateInput} type="text" className="form-control" placeholder="Your Message" />
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
