import React, { useEffect, useState } from 'react';
import firebase from '../firebaseConfig'
import { useHistory, useLocation } from 'react-router-dom'
import 'font-awesome/css/font-awesome.min.css'
import Noty from 'noty'

function Movie(props){

    const [coverImage, setCoverImage] = useState('')
    const [dateOfEntry, setDateOfEntry] = useState('')
    const [description, setDescription] = useState('')
    const [name, setName] = useState('')
    const [previewRating, setPreviewRating] = useState('')
    const [rating, setRating] = useState('')
    const [images, setImages] = useState([])
    const [displayedImages, setDisplayedImages] = useState([])
    const [firebaseId, setFirebaseId] = useState('')
    const [readOnly, setReadOnly] = useState(true)
    const [edited, setEdited] = useState(false)
    const [editImage, setEditImage] = useState(false)
    const [editedImages, setEditedImages] = useState(false)
    let   [likeStatus, setLikeStatus] = useState(false)
    let history = useHistory();
    let location = useLocation()
    const [googleId, setGoogleId] = useState('')
    let [likeAmount, setLikeAmount] = useState([])
    const [peopleWhoLike, setPeople] = useState([])
    const [checked, setChecked] = useState(false)
    const [presentUsername, setUsername] = useState('')
    const [singleComment, setSingleComment] = useState('')
    const [commentsToDisplay, setCommentsToDisplay] = useState([])
    const [commentsTemp, setCommentsTemp] = useState([])
    const [showComments, setShowComments] = useState(true)
    const [userProfilePic, setUserProfilePic] = useState('')
    const [commentCount, setCommentCount] = useState('')

    useEffect(() => {
      
        let i = 0
        let y = 0
        let count = 0
        let person
        let arr = []
        let localStorageObject = JSON.parse(localStorage.getItem('user'));
        setGoogleId(localStorageObject.googleId)
        var myInfo =  firebase.database().ref('users/' + localStorageObject.googleId)
        myInfo.once('value', snapshot => {
            setUsername(snapshot.val().userName)
            setUserProfilePic(snapshot.val().profileURL)
        } )
        var userInfo = firebase.database().ref('users').orderByChild('userName').equalTo(props.username);
        userInfo.once("value", (snapshot) => {
            snapshot.forEach((data) => {
                setFirebaseId(data.key)
                var movieEntry = firebase.database().ref('users/' + data.key + '/journals/' + props.movieId)
                movieEntry.once('value').then( (snapshot) => {
                    setName(snapshot.val().name)
                    setCoverImage(snapshot.val().coverImage)
                    setDateOfEntry(snapshot.val().dateOfEntry)
                    setRating(Number(snapshot.val().rating))
                    setPreviewRating(Number(snapshot.val().rating))
                    setDescription(snapshot.val().description)
                    setImages(snapshot.val().images)
                    setDisplayedImages(snapshot.val().images)
                    if (snapshot.val().likes!==undefined) {
                        for(i in snapshot.val().likes) {
                            var personCheck = firebase.database().ref('users/' + i)
                            personCheck.once('value', (snapshot) => {
                                    person = (snapshot.val().userName)
                                    if (i === localStorageObject.googleId) { 
                                        setLikeStatus(true) 
                                    }
                                    arr.push(person)
                              })
                              count++
                        }
                        setPeople(arr)
                        setLikeAmount(count)
                    }
                    if (snapshot.val().comments!==undefined) {
                        let test = []
                        let count = 0
                        for (y in snapshot.val().comments) {
                            let tempObj = {
                                username: snapshot.val().comments[y].username,
                                comment: snapshot.val().comments[y].comment,
                                profilePic: snapshot.val().comments[y].profilePic,
                            }
                            count++
                            setCommentCount(count)
                            test.push(tempObj)
                        }
                        setCommentsToDisplay(test)
                        setCommentsTemp(test)
                        
                    }
                })
            });
        });
    }, [props.movieId, props.username],[location.appId]);
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
    function getMovieImages() {
        let url = ''.concat('https://api.themoviedb.org/3/', 'movie/' ,props.movieId , '/images', '?api_key=', process.env.REACT_APP_MOVIEDB_API_KEY);
        fetch(url).then(result=>result.json()).then((data)=>{
            let imageList = [];
            for (var i in data.backdrops) {
                let imageUrl = 'https://image.tmdb.org/t/p/w500'+data.backdrops[i].file_path
                if (imageUrl !== 'https://image.tmdb.org/t/p/w500null'){
                    imageList.push(imageUrl)
                }
            }
            setDisplayedImages(imageList)
        })
    }

    function updateRating(updatedRating) {
        setRating(updatedRating)
        setPreviewRating(updatedRating)
        firebase.database().ref('users/' + firebaseId + '/journals/' + props.movieId).update({rating: updatedRating});
        showNotification()
    }

    function showNotification(){
        new Noty({
            type: 'info',
            theme: 'bootstrap-v4',
            layout: 'bottomRight',
            text: 'Comment Added!',
            timeout: 1000
        }).show()
    }

    function handleDeleteMovie(){
        firebase.database().ref('users/' + firebaseId + '/journals/' + props.movieId).remove()
        history.push("/" + props.username)
    }

    function fiveStar(){
        const stars = []
        for (let i = 0; i < previewRating; i++) {
            stars.push(<i class="fa fa-star fa-2x text-yellow-300 pr-1 cursor-pointer" onMouseOver={() => props.localUser ? setPreviewRating(i+1): null} onMouseLeave={() => props.localUser ? setPreviewRating(rating): null} onClick={() => props.localUser? updateRating(i+1):null}></i>)
        }
        for (let i = previewRating; i < 5; i++) {
            stars.push(<i class="fa fa-star fa-2x text-gray-300 pr-1 cursor-pointer" onMouseOver={() => props.localUser ? setPreviewRating(i+1): null} onMouseLeave={() => props.localUser ? setPreviewRating(rating): null} onClick={() => props.localUser? updateRating(i+1):null}></i>)
        }
        return stars
    }
    function like() {
        if (likeStatus === false) {
            firebase.database().ref('users/' + firebaseId + '/journals/' + props.movieId + '/likes/' + googleId).set({
                liked: true
             })
             setLikeStatus(true)
             setLikeAmount(++likeAmount)
             setPeople([...peopleWhoLike,presentUsername])
        }
        else {
            firebase.database().ref('users/' + firebaseId + '/journals/' + props.movieId + '/likes/' + googleId).remove()
            setLikeStatus(false)
            setLikeAmount(--likeAmount)
            setPeople(peopleWhoLike.filter(url=>url!==presentUsername))
        }       
    }
    function handleComment(e) {
        let temp = e.target.value
        setSingleComment(temp)
    }
    function submitComment () {
      let commentObjArr = []
      if (commentCount > 0) {
            
            let thisDate = getExactDate('/')
            let commentObj = {
                username: presentUsername,
                comment: singleComment,
                profilePic: userProfilePic,
                timestamp: thisDate
            }
            setCommentsToDisplay([...commentsToDisplay, commentObj])
            let newTemp = commentsToDisplay
             newTemp.push(commentObj)
            commentObjArr.push(commentObj)
            firebase.database().ref('users/' + firebaseId + '/journals/' + props.movieId).update({
               comments: newTemp
               
             })
        }
        else {
            
            commentObjArr = commentsTemp
            let thisDate = getExactDate('/')
            let commentObj = {
                username: presentUsername,
                comment: singleComment,
                profilePic: userProfilePic
            }
            commentObjArr.push(commentObj)
            setCommentsToDisplay([...commentsToDisplay, commentObj])
            firebase.database().ref('users/' + firebaseId + '/journals/' + props.movieId).update({
               comments: commentObjArr
               
            })
        }
        showNotification()
    }
    function deleteComment (firstItem) {
        setCommentsToDisplay(commentsToDisplay.filter(url => url !== firstItem))
        let commentTemp = commentsToDisplay
        commentTemp = commentTemp.filter(url=>url!==firstItem)
        firebase.database().ref('users/' + firebaseId + '/journals/' + props.movieId).update({
            comments: commentTemp
        })
    }

    return (
        <React.Fragment>
        {/* non-mobile UI */}
        <div class="md:flex w-screen justify-center mt-3 hidden">
            <div class = "w-2/3">
                <div class="flex justify-between font-montserrat">
                    <p class="text-3xl font-semibold">{name}</p>
                    <p class="text-xl">{dateOfEntry}</p>
                </div>
                <div class="flex">
                    <div class = "w-1/4">
                        <img src={coverImage} alt="poster"></img>
                    </div>
                    <div class = "flex flex-col justify-between w-3/4 pl-5 font-montserrat">
                        <div class="flex w-full justify-between items-center">
                            <div>{fiveStar()}</div>
                            {props.localUser ? <i class="fa fa-trash fa-lg hover:text-gray-600 cursor-pointer" onClick={handleDeleteMovie}></i>:null}
                        </div>
                        <div class="flex flex-col bg-gray-100 p-3" style={{height:'19rem'}}>
                            <div class="flex justify-between">
                                <p class="text-md font-semibold mr-2">Review</p>
                            {props.localUser ?
                                readOnly ? 
                                    <i class="fa fa-pencil fa-sm hover:text-gray-600 cursor-pointer" onClick={() => setReadOnly(false)}></i>
                                    : 
                                    <i class="fa fa-check fa-sm hover:text-gray-600 cursor-pointer" onClick={() => {
                                        setReadOnly(true)
                                        if (edited) {
                                            showNotification()
                                            firebase.database().ref('users/' + firebaseId + '/journals/' + props.movieId).update({description: description})
                                        }
                                    }}></i> 
                                : null
                            }
                            </div>
                            <textarea type = "textarea" 
                            onChange={(e) => {
                                setDescription(e.target.value)
                                setEdited(true)
                            }}
                            class={readOnly ? "p-2 text-sm w-full h-full bg-gray-100 outline-none resize-none": "p-2 text-sm w-full h-full bg-white-100 resize-none"} 
                            defaultValue={description} readOnly={readOnly}/>
                        </div>
                    </div>
                </div>
                <div class = "flex flex-col w-full my-5 font-montserrat bg-gray-100 p-8">
                    <div class="flex justify-between">
                        <p class = "text-xl font-semibold mb-4">Images</p>
                        {
                            props.localUser ?
                                editImage ?
                                    <i class="fa fa-check fa-sm hover:text-gray-600 cursor-pointer" onClick={() => {
                                        if (displayedImages !== images) {
                                            setEditImage(false)
                                            setDisplayedImages(images)
                                            if (editedImages){
                                                showNotification()
                                                firebase.database().ref('users/' + firebaseId + '/journals/' + props.movieId).update({images: images})
                                                setEditedImages(false)
                                            }
                                        }
                                    }}></i>
                                :
                                    <i class="fa fa-pencil fa-sm hover:text-gray-600 cursor-pointer" onClick={() => {getMovieImages(); setEditImage(true);}}></i>
                            :
                            null
                        }
                    </div>
                    <div class="w-full grid grid-cols-3 gap-8">
                        {displayedImages ? displayedImages.map(image => 
                            <img src={image} alt="movie still" class={images && images.includes(image) && editImage ? "cursor-pointer border-yellow-400 border-solid border-4" : "cursor-pointer"} 
                            onClick={() => {
                                if (!images) setImages([image])
                                if (images.includes(image)) setImages(images.filter(url => url !== image))
                                else if (!images.includes(image)) setImages([...images,image])
                                setEditedImages(true)
                            }}/>
                        ): null}
                    </div>
                </div>
                <div class = "flex flex-row pb-2">
                    <i class={likeStatus === false?"fa fa-heart-o fa-2x text-red-600":"fa fa-heart fa-2x text-red-600"} onClick = {()=> {
                    like() 
                    }} aria-hidden="true"></i>
                    
                    <div class = "pl-2 cursor-pointer text-lg" onClick = {()=>{setChecked(!checked)}}>Likes: {likeAmount}</div>
                </div>
                <div class = {checked?"flex flex-col border-2 border-gray-400 bg-gray-200 h-auto": "hidden"}> People Who Like This:
                            {peopleWhoLike.map(item=>
                            <li class = "cursor-pointer" onClick = {()=>history.push('/' + item)}>{item}</li>
                    )}</div>
                <div class = "bg-gray-200 h-auto p-4 ">
                    <h6 class = "text-xl font-semibold">Comments</h6>
                    <div class = "mt-8 flex-row flex items-center ">
                        <textarea class =  "w-5/6 resize-none h-24 outline-none rounded" onChange = {(e)=> handleComment(e)}></textarea>
                        <button class = "bg-blue-600 rounded text-white h-12 w-32 ml-4"onClick = {
                            ()=>{
                            submitComment()
                            }}>Submit</button>
                    </div>
                    <div class = "h-auto mt-4"  >
                        {showComments?commentsToDisplay.map(firstItem => 
                            <div class = "mt-4 p-2 border-2 border-gray-400 h-auto flex flex-row justify-between ">
                                <div class = "flex flex-row">
                                    <div class= "flex-grow-0 flex-shrink-0 flex-row rounded-full h-16 w-16 flex bg-cover justify-center mr-8 pt-8 cursor-pointer bg-white" onClick = {()=>history.push('/' + firstItem.username)} style={{backgroundImage: "url('" + firstItem.profilePic + "')"}}/>
                                    <div class = "flex flex-col">
                                        <div class = "cursor-pointer" onClick = {()=>history.push('/' + firstItem.username)}>
                                            {firstItem.username} 
                                        </div>
                                        <div class = "mt-2">
                                            {firstItem.comment}
                                        </div>
                                        
                                    </div>
                                </div>
                                    {props.username === presentUsername || presentUsername === firstItem.username ? <i class="fa fa-trash fa-lg hover:text-gray-600 cursor-pointer" onClick={()=>deleteComment(firstItem)}></i>:null}
                            </div>
                            
                        ):null}
                    </div>
                </div>
            </div>
        </div>
        {/* mobile UI */}
        <div class="flex flex-col items-center w-screen p-6 font-montserrat md:hidden">
            <div class="flex w-full justify-between">
                <p class="text-sm">{dateOfEntry}</p>
                {props.localUser ? <i class="fa fa-trash fa-lg hover:text-gray-600 cursor-pointer" onClick={handleDeleteMovie}></i>:null}
            </div>
            <p class="text-3xl text-center font-semibold my-2">{name}</p>
            <img class="w-2/3"src={coverImage} alt="poster"></img>
            <div class="my-3">
                {fiveStar()}
            </div>
            <div class="flex flex-col w-full my-3" style={{height:'19rem'}}>
                <div class="flex justify-between">
                    <p class="text-xl font-semibold">Review</p>
                {props.localUser ?
                    readOnly ? 
                        <i class="fa fa-pencil fa-sm hover:text-gray-600 cursor-pointer" onClick={() => setReadOnly(false)}></i>
                        : 
                        <i class="fa fa-check fa-sm hover:text-gray-600 cursor-pointer" onClick={() => {
                            setReadOnly(true)
                            if (edited) {
                                showNotification()
                                firebase.database().ref('users/' + firebaseId + '/journals/' + props.movieId).update({description: description})
                            }
                        }}></i> 
                    : null
                }
                </div>
                <textarea type = "textarea" 
                onChange={(e) => {
                    setDescription(e.target.value)
                    setEdited(true)
                }}
                class={readOnly ? "p-2 text-sm w-full h-full outline-none resize-none": "p-2 text-sm w-full h-full bg-gray-100 resize-none"} 
                defaultValue={description} readOnly={readOnly}/>
            </div>
            <div class = "flex flex-row pb-2">
                <i class={likeStatus === false?"fa fa-heart-o fa-2x text-red-600":"fa fa-heart fa-2x text-red-600"} onClick = {()=> {
                like() 
                }} aria-hidden="true"></i>
                <div class = "pl-2 cursor-pointer text-lg font-bold" onClick = {()=>{setChecked(!checked)}}>Likes: {likeAmount}</div>
            </div>
            <div class = {checked?"flex flex-col border-2 border-gray-400 bg-gray-200 h-auto w-full": "hidden"}> People Who Like This:
                        {peopleWhoLike.map(item=>
                        <li class = "cursor-pointer" onClick = {()=>history.push('/' + item)}>{item}</li>
            )}</div>
            <div class = "flex flex-col w-full my-3">
                    <div class="flex justify-between">
                        <p class = "text-xl font-semibold mb-4">Images</p>
                        {
                            props.localUser ?
                                editImage ?
                                    <i class="fa fa-check fa-sm hover:text-gray-600 cursor-pointer" onClick={() => {
                                        if (displayedImages !== images) {
                                            setEditImage(false)
                                            setDisplayedImages(images)
                                            if (editedImages){
                                                showNotification()
                                                firebase.database().ref('users/' + firebaseId + '/journals/' + props.movieId).update({images: images})
                                                setEditedImages(false)
                                            }
                                        }
                                    }}></i>
                                :
                                    <i class="fa fa-pencil fa-sm hover:text-gray-600 cursor-pointer" onClick={() => {getMovieImages(); setEditImage(true);}}></i>
                            :
                            null
                        }
                    </div>
                    <div class="w-full grid grid-cols-1 gap-3">
                        {displayedImages ? displayedImages.map(image => 
                            <img src={image} alt="movie still" class={images && images.includes(image) && editImage ? "cursor-pointer border-yellow-400 border-solid border-4" : "cursor-pointer"} 
                            onClick={() => {
                                if (!images) setImages([image])
                                if (images.includes(image)) setImages(images.filter(url => url !== image))
                                else if (!images.includes(image)) setImages([...images,image])
                                setEditedImages(true)
                            }}/>
                        ): null}
                    </div>
                    <div class = "bg-gray-200 h-auto p-4 mt-6 ">
                        <h6 class = "text-lg font-bold">Comments</h6>
                        <div class = "mt-8 flex-col flex items-center ">
                            <textarea class =  "w-full  h-24 rounded" onChange = {(e)=> handleComment(e)}></textarea>
                            <button class = "bg-blue-600 rounded text-white h-12 w-32 mt-4"onClick = {
                                ()=>{
                                submitComment()
                                }}>Submit
                            </button>
                    </div>
                    <div class = "h-auto mt-4"  >
                        {showComments?commentsToDisplay.map(firstItem => 
                            <div class = "mt-4 p-2 border-2 border-gray-400 h-auto flex flex-row justify-between ">
                                <div class = "flex flex-row">
                                    <div class= "flex-grow-0 flex-shrink-0 flex-row rounded-full h-16 w-16 flex bg-cover justify-center mr-8 pt-8 cursor-pointer bg-white" onClick = {()=>history.push('/' + firstItem.username)} style={{backgroundImage: "url('" + firstItem.profilePic + "')"}}/>
                                    <div class = "flex flex-col text-sm">
                                        <div class = "cursor-pointer" onClick = {()=>history.push('/' + firstItem.username)}>
                                            {firstItem.username} 
                                        </div>
                                        <div class = "mt-2">
                                            {firstItem.comment}
                                        </div>
                                        
                                    </div>
                                </div>
                                    {props.username === presentUsername || presentUsername === firstItem.username ? <i class="fa fa-trash fa-lg hover:text-gray-600 cursor-pointer" onClick={()=>deleteComment(firstItem)}></i>:null}
                            </div>
                            
                        ):null}
                    </div>
                </div>
            </div>
        </div>
        </React.Fragment>
    );
}

export default Movie;

