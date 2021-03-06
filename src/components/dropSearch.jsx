import React, { Component } from 'react';

class DropSearch extends Component {
    constructor(props) {
        super(props)
        this.state = {  
            text: null,
            items: [],
            date: '',
        }
    }
    componentWillMount() {
        document.addEventListener('mousedown', this.handleClick, false);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClick, false)
    }
    handleClick = (e) => {
        if (this.node.contains(e.target)) {
            return;
        }
        this.handleClickOutside()
    }
    handleClickOutside = (e) => {
        this.setState({items:[]})
    }
    onTextChanged = (e) => {
        var value = e.target.value;
        if (value[0]!==' ' && value.length > 0) {
            this.setState({items: []})
            let url = ''.concat('https://api.themoviedb.org/3/', 'search/movie?api_key=', process.env.REACT_APP_MOVIEDB_API_KEY, '&query=', value);
            fetch(url).then(result=>result.json()).then((data)=>{
                this.setState({
                    items: data.results,  
                })
            })
            this.setState({text: value})
            this.props.onChange(e)
        }
       
        else {
            this.setState({
                items: [],
                text: ''
            })
        }
    }
    suggestionSelected = (title, year, id) => {
        this.setState({
            text:title,
            items: [],
            date: year,
        })
        this.props.onChange2(title, year)
        this.props.getMovieInfo(title, id)
    }
    renderSuggestions = () => {
        if (this.state.items.length === 0) {
            return null;
        }
            return (
                <ul  class = {this.props.show?"absolute overflow-y-scroll h-64  border-4 border-grey-800 bg-gray-100 w-1/2 sm:w-1/5 ":"absolute overflow-scroll h-64  border-4 border-grey-800 bg-gray-100 w-3/4 sm:w-2/5"}> 
                    {this.state.items.map((item) => <li class = "hover:opacity-100 focus:shadow-outline  cursor-pointer" onClick = {()=>this.suggestionSelected(item.title, item.release_date, item.id)}>
                        <div  class={item.release_date ? "hover:opacity-100 focus:shadow-outline" : item.release_date = '-' }>
                            <div class=" self-center  h-24 w-64 flex bg-cover "> 
                                <img class = "h-24 w-16" src = {item.poster_path!==null ?'https://image.tmdb.org/t/p/w500'+ item.poster_path : "https://upload.wikimedia.org/wikipedia/commons/1/16/No_image_available_450_x_600.svg"}/>
                                <div class="flex flex-col pl-4 ">
                                    <p class="sm:text-base text-xs font-semibold text-black">{item.title}</p>
                                    <p class="text-xs text-black">{(item.release_date.split('-')[0])}</p>
                                </div> 
                            </div>    
                        </div>
                        <br/>
                    </li>)}
                </ul>
            )
    }
    render () {
        return (
            <div ref = {node => this.node = node} class= "h-10 object-bottom w-full">
                <input autocomplete = "off" id = "searchBar" class = "outline-none h-full rounded sm:text-base text-xs cursor-pointer w-full " value = {this.state.text} onChange = {this.onTextChanged} 
                onKeyPress={event => {
                    if (event.key === 'Enter') {
                      this.props.getMovieInfo(this.state.text)
                    }
                  }}
                  type = "text" placeholder = {this.props.name && (this.state.text === null)?this.props.name:"Search for a movie to add!"}/>
                 {this.renderSuggestions()}
            </div>
        )
    }
}
export default DropSearch;