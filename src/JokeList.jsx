import React, { Component } from 'react';
import Joke from './Joke';
import './JokeList.css';
import axios from 'axios';
import uuid from 'uuid/v4';

class JokeJist extends Component {
    static defaultProps = {
        numJokesToGet: 10
    }

    constructor(props) {
        super(props);
        this.state = {
            jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
            loading: false
        }

        this.seenJokes = new Set(this.state.jokes.map(j => j.text));

        this.handleVotes = this.handleVotes.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.clearStorage = this.clearStorage.bind(this);
    }

    
    componentDidMount() {
        if(this.state.jokes.length === 0) this.getJokes();
        console.log(new Date().toLocaleTimeString());
    }
    
    
    handleVotes(id, delta) {
        this.setState(st => ({
            jokes: st.jokes.map(j => j.id === id ? {...j, votes: j.votes + delta} : j)
        }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)))
    }
    
    async getJokes() {
        try {
            let jokes = [];
            while(jokes.length < this.props.numJokesToGet) {
                let result = await axios.get('https://icanhazdadjoke.com/', {headers: {Accept: 'application/json'}});
                
                if(!this.seenJokes.has(result.data.joke)) {
                    jokes.push({
                        id: uuid(),
                        text: result.data.joke,
                        votes: 0
                    });
                }
                else {
                    console.log('FOUND A DUPLICATE!!!');
                    console.log(result.data.joke);
                }
            }
            
            this.setState(st => ({
                loading: false,
                jokes: [...st.jokes, ...jokes]
            }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes)));
        }
        catch(e) {
            alert(e);
            this.setState({loading: false});
        }
    }
    
    handleClick() {
        this.setState({ loading: true }, this.getJokes);
    }

    clearStorage() {
        window.localStorage.clear();
    }

    render() {
        if (this.state.loading) {
            return(
                <div className="JokeList-spinner">
                    <i className="far fa-8x fa-laugh fa-spin"></i>
                    <h1 className="JokeList-title">Loading...</h1>
                </div>
            )
        }
        else {
            return ( 
                <div className="JokeList">
                    <div className="JokeList-sidebar">
                        <button className="clear-storage-btn" onClick={this.clearStorage}>Clear storage</button>
                        <h1 className="JokeList-title"><span>Dad</span> jokes</h1>
                        <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" alt="smiley face" />
                        <button className="JokeList-getmore" onClick={this.handleClick}>Fetch Jokes</button>
                    </div>
                    <div className="JokeList-jokes">
                        {this.state.jokes.map(j => 
                            <Joke 
                                key={j.id} 
                                text={j.text} 
                                votes={j.votes} 
                                upvote={() => this.handleVotes(j.id, 1)} 
                                downvote={() => this.handleVotes(j.id, -1)} 
                            />
                        )}
                    </div>
                </div>
             );
        }
    }
}
 
export default JokeJist;