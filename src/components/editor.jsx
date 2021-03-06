import React, { useState, useEffect } from 'react'
import firebase from '../firebaseConfig'
import Noty from 'noty'
import 'noty/lib/noty.css'
import 'noty/lib/themes/bootstrap-v4.css'
import 'font-awesome/css/font-awesome.min.css'
import Switch from "react-switch";
import { useHistory,useLocation, useRef } from 'react-router-dom'
import DropSearch from './dropSearch'

require('dotenv').config()

function Editor (props) {
  
   const [movieName, setMovieName] = useState('')
   const [movieRating, setMovieRating] = useState('5')
   const [movieReview, setMovieReview] = useState('')
   const [movieYear, setMovieYear] = useState('')
   const [movieId, setMovieId] = useState('')
   const [movieImage, setMovieImage] = useState('')
   const [change, setChange] = useState(false)
   const [featured, setFeatured] = useState(true)
   const [specificImages, setSpecificImages] = useState([])
   const [imagesToStore, setImagesToStore] = useState([])
   const [checked, setChecked] = useState(true)
   const [previewRating, setPreviewRating] = useState(5)
   const [presentDay, setPresentDay] = useState('')
   const [searched, setSearched] = useState(false)
   const [show, setShow] = useState(false) 
   const [exactDate, setExactDate] = useState('')
   
   let location = useLocation()
   let history = useHistory()

  
   useEffect(() => {
        setPresentDay(getCurrentDate('/'))
        setExactDate(getExactDate('/'))
        if (location.movieId) {
            setMovieId(location.movieId)
            setMovieName(location.title)
            getMovieInfo(location.title,location.movieId)
            getMovieImage(location.movieId)
            setChange(true)
        }
    },[location.movieId],[location.title])
  
   function fiveStar () {
        const stars = []
        for (let i = 0; i < previewRating; i++) {
            stars.push(<i class="fa fa-star fa-2x text-blue-300 pr-1 cursor-pointer" onMouseOver={() => setPreviewRating((i+1))} onMouseLeave={() => setPreviewRating((movieRating))} onClick={()=> {
                setMovieRating(i+1) 
                setPreviewRating(i+1) 
                setChange(true)}}></i>)
        }
        for (let i = previewRating; i < 5; i++) {
            stars.push(<i class="fa fa-star fa-2x text-gray-300 pr-1 cursor-pointer" onMouseOver={() => setPreviewRating((i+1))} onMouseLeave={() => setPreviewRating((movieRating))} onClick={() => {
                setMovieRating(i+1)
                setPreviewRating(i+1)
                setChange(true)}} ></i>)
        }
        return stars
    }
    function showNotification () {
        new Noty({
            type: 'success',
            theme: 'bootstrap-v4',
            layout: 'bottomRight',
            text: 'You Changes Have Been Saved!',
            timeout: 3000
        }).show()
    }
    function getCurrentDate (separator='') {

      let newDate = new Date()
      let date = newDate.getDate();
      let month = newDate.getMonth() + 1;
      let year = newDate.getFullYear();
      
      return `${month<10?`0${month}`:`${month}`}${separator}${date}${separator}${year}`

    }
    function getExactDate (separator='') {

        let newDate = new Date()
        let date = newDate.getDate();
        let month = newDate.getMonth() + 1;
        let year = newDate.getFullYear();
        var hours = newDate.getHours(); //To get the Current Hours
        var min = newDate.getMinutes(); //To get the Current Minutes
        var sec = newDate.getSeconds(); //To get the Current Seconds
        if (month < 10) month = '0' + month
        if (date < 10) date = '0' + date
        if(hours<10) hours = '0' + hours
        if(min<10) min= '0' + min
        if(sec<10) sec='0' + sec
        return year + month + date + hours + min + sec
  
    }
    function getMovieInfo (title, id) {
        setShow(true)
        let flag = false
        let def = ''
        let defID = ''
        setSearched(true)
        setImagesToStore([])
        setSpecificImages([])
        let url = ''.concat('https://api.themoviedb.org/3/', 'search/movie?api_key=', process.env.REACT_APP_MOVIEDB_API_KEY, '&query=', title);
        fetch(url).then(result=>result.json()).then((data)=>{
                var i
                let tempID
                for (i in data.results) {
                    def = data.results[0].poster_path
                    defID = data.results[0].id
                  let movieEntry = {
                    image: ('https://image.tmdb.org/t/p/w500'+data.results[i].poster_path),
                    title: data.results[i].title,
                    id: data.results[i].id
                  }
                  movieEntry.id = ''.concat(movieEntry.id)
                  tempID = ''.concat(id)
                  if (movieEntry.id === tempID && movieEntry.image === 'https://image.tmdb.org/t/p/w500null'){
                    setMovieImage("https://upload.wikimedia.org/wikipedia/commons/1/16/No_image_available_450_x_600.svg")
                    setMovieId(movieEntry.id)
                  }
                  else if (movieEntry.id === tempID) {
                    setMovieName(movieEntry.title)
                    setMovieImage(movieEntry.image)
                    setMovieId(movieEntry.id)
                    getMovieImage(movieEntry.id)
                    flag = true
                  }
                }
                if (flag === false) {
                  setMovieImage("https://upload.wikimedia.org/wikipedia/commons/1/16/No_image_available_450_x_600.svg")
                  setMovieId(defID)
                  getMovieImage(defID)
                }
        })
    }
    
    function getMovieImage (i, n) {
      setSpecificImages([])
      let url = ''.concat('https://api.themoviedb.org/3/', 'movie/' ,i , '/images', '?api_key=', process.env.REACT_APP_MOVIEDB_API_KEY, '&query=', movieName);
      fetch(url).then(result=>result.json()).then((data)=>{
        let imageList = []
              var i
              for (i in data.backdrops) {
                let movieImageEntry = {
                  image: ('https://image.tmdb.org/t/p/w500'+data.backdrops[i].file_path),
                }
                if (movieImageEntry.image !== 'https://image.tmdb.org/t/p/w500null'){
                  imageList.push(movieImageEntry)
                }
            }  
              setSpecificImages(imageList)
        })
    }
    function handleSubmit () {
        if (change) {
          showNotification()
            firebase.database().ref(`users/${props.googleId}/journals/${movieId}`).set({
                name: movieName,
                coverImage: movieImage,
                dateOfEntry: presentDay,
                rating: movieRating,
                description: movieReview,
                featured: featured,
                images: imagesToStore,
                movieYear: movieYear,
                timestamp: exactDate
            })  
        }
        setMovieRating('5')
        history.push(props.username + '/movies/' + movieId)
    }
    function handleSpecificImgClick (e) {
      if (imagesToStore.includes(e)) {
        setImagesToStore(imagesToStore.filter(url => url !== e))
      }
      else {
       setImagesToStore([...imagesToStore,e])
      }
    }
    return (
        <div class="flex flex-col font-montserrat w-screen items-center mt-3">
            <div class = "flex lg:w-2/3  md:w-2/3 sm:w-11/12 w-10/12  items-center">
                <div class = {show?"hidden":"justify-center sm:ml-48 ml-8 sm:w-7/12 w-10/12 border-b border-b-2 border-gray-400 pt-24"}>
                        <p class = "pb-4 text-2xl">Editor</p>
                            <div class = "flex w-full">
                                <div class = "flex w-full sm:w-10/12">
                                    <DropSearch getMovieInfo = {(name,id)=>getMovieInfo(name,id)} onChange = {(e) => {
                                            setMovieName(e.target.value)
                                            setChange(true)
                                        }}  
                                        onChange2 = {(e, date) => {
                                            setMovieName(e)
                                            setChange(true)
                                            setMovieYear(date)
                                        }}
                                        name = {movieName} show = {show}>
                                    </DropSearch>
                                </div>
                                    <svg onClick = {() => change?getMovieInfo(movieName):null}  class = " sm:ml-16 cursor-pointer" width="30" height="30" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" />
                                        <circle cx="20.5" cy="17.5" r="10.5" stroke="black" stroke-width="2" />
                                        <line x1="28.1584" y1="25.244" x2="37.256" y2="34.3417" stroke="black" stroke-width="2" stroke-linecap="round" />
                                    </svg>
                            </div>
                </div>
                <div class = {show?"w-full grid grid-row-2 row-gap-24 sm:gap-12":"hidden"}>
                    <div class = "sm:grid sm:grid-cols-2 h-64 mb-12">
                        <div class = "w-full h-full">
                            <p class="font-serif text-3xl font-bold pb-4 ">Editor</p>
                            <div class = "grid grid-cols-2 gap-2 ">  
                                <div class = "sm:w-64 h-20 w-32 ">
                                    <p>Film Title</p>
                                    <div class = "flex flex-row border-b border-b-2 border-gray-400">
                                        <DropSearch getMovieInfo = {(name,id)=>getMovieInfo(name,id)} onChange = {(e) => {
                                            setMovieName(e.target.value)
                                            setChange(true)
                                        }}  
                                        onChange2 = {(e, date) => {
                                            setMovieName(e)
                                            setChange(true)
                                            setMovieYear(date)
                                        }}
                                        name = {movieName} show = {show}>
                                        </DropSearch> 
                                        <svg onClick = {() => change?getMovieInfo(movieName):null}  class = "cursor-pointer" width="30" height="30" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" />
                                            <circle cx="20.5" cy="17.5" r="10.5" stroke="black" stroke-width="2" />
                                            <line x1="28.1584" y1="25.244" x2="37.256" y2="34.3417" stroke="black" stroke-width="2" stroke-linecap="round" />
                                        </svg>
                                    </div>
                                </div>
                                <div class = {show?"sm:hidden w-full  ":"hidden"}>
                                    <div class = "flex sm:h-full h-56 w-full sm:w-4/5 border-4 border-gray-400 border-2 bg-cover bg-center flex" >
                                        <img src = {movieImage} alt = "movieImage"></img>
                                    </div>
                                 </div>
                            </div>
                            <div class = {show?"sm:pt-12 h-64 sm:mt-8 sm:w-full items-center":"hidden "}>
                                <p >Review</p>
                                <textarea type = "textarea" 
                                    onChange = {(e) => {
                                        setMovieReview(e.target.value) 
                                        setChange(true)
                                        }} 
                                        class="outline-none resize-none whitespace-normal flex-no-wrap text-sm border-2 border-gray-400 px-2 w-full sm:w-full h-64" placeholder="Description"/>  
                            </div>
                            <div class = "pt-4 sm:mt-20 mt-8 sm:ml-0 ml-16 ">{fiveStar()}</div>        
                        </div>
                            <div class = {show?"hidden sm:flex sm:justify-end h-64 sm:h-full w-full pt-12 ":"hidden"}>
                                <div class = " flex sm:h-full h-48 w-32 sm:w-4/5 border-4 border-gray-400 border-2 bg-cover bg-center flex" >
                                    <img src = {movieImage} alt = "movieImage"></img>
                                </div>
                            </div>
                        </div>
                        <div class = {show?" sm:w-full h-1/2 w-full mt-64": " hidden"}>    
                                <label class = "sm:mt-20 mt-2 sm:ml-0">Image Selection</label>
                            <div class =  {searched === false ? "flex text-sm border-solid border-2 border-gray-400  p-2 bg-gray-200 mt-2 h-auto w-full " : "flex text-sm border-solid border-2 border-gray-400 p-2 bg-gray-200 mt-2 h-auto w-full"}>
                                <div class="h-auto justify-between grid sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-8 sm:p-8 cursor-pointer ">
                                    {specificImages.map(movieImageEntry =>    
                                        <img src={movieImageEntry.image} class={imagesToStore.includes(movieImageEntry.image) ? "border-blue-400 border-solid border-4" : "hover:opacity-75 transition ease-in-out duration-200 transform hover:-translate-y-1 hover:scale-105" } onClick = {() => handleSpecificImgClick(movieImageEntry.image)}></img>
                                    )}
                                </div>
                            </div>
                            <div class = "flex grid grid-cols-2 pl-8 items-end sm:ml-20 sm:w-4/5 w-full pt-2 pb-2">
                            <div class = "w-full items-center sm:ml-16  mt-2 -mx-8">
                                <label class = "" >
                                    <p class = "pl-2">Feature?</p>
                                    <div class = "sm:px-2">
                                        <Switch onChange={()=>{
                                            setChecked(!checked)
                                            setFeatured(!featured)
                                            }} checked={checked} onColor = "#1E90FF" height = {36} width = {88} />
                                    </div>
                                </label>
                            </div>
                            <button onClick ={change? ()=>handleSubmit() :null} class= "rounded-full hover:opacity-75 text-sm  border-2 border-gray-400 bg-gray-200 sm:py-2 sm:px-4 w-full sm:w-11/12 sm:ml-4  mb-4 h-12" type="button">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    
}
export default Editor;

