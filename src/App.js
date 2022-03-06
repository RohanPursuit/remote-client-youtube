import {io} from "socket.io-client"
import {useState} from "react"
import axios from "axios"
import "./App.css"

const URL = process.env.REACT_APP_API_URL
let socket = io(URL,{
  query: {
    password: "246"
  }
})


function App() {
  const [requests, setRequest] = useState([])
  const [info, setInfo] = useState([])
  const [auth, setAuth] = useState({
    success: false,
    password: ""
  })
  function handleClientConnect(password) {
    console.log("try reconnect")
    socket = io(URL,{
      query: {
        password
      }
    })
    socket.on('connect', () => {
      console.log("You Connected")
      socket.on("success", (obj)=> {
        setAuth(obj)
      })
    })
    socket.on("playlist", async (playlist) => {
      console.log(playlist)
      setRequest(playlist)
        await axios.get(`${URL}/info`, {params:{requests: playlist}})
        .then(response => {
          console.log(response)
          setInfo(response.data.payload)
        })
      })
    
  }
  function handleReset() {
    setAuth({success: false, password: ""})

  }
  
  socket.on('connect', () => {
    console.log("You Connected")
    socket.on("success", (obj)=> {
      setAuth(obj)
    })
    socket.on("playlist", async (playlist) => {
    console.log(playlist)
    setRequest(playlist)
      await axios.get(`${URL}/info`, {params:{requests: playlist}})
      .then(response => {
        console.log(response)
        setInfo(response.data.payload)
      })
    })
  })
  socket.off("server-message").on("server-message", async (message) => {
    console.log(message)
    setRequest(message.requests)
    await axios.get(`${URL}/info`, {params:{requests: message.requests}})
      .then(response => {
        console.log(response)
        setInfo(response.data.payload)
      })
  })

  socket.off("reconnect").on("reconnect", () => {
    console.log("Client try reconnect")
    socket.emit("mydisconnect")
    handleReset()
    // handleClientConnect(auth.password)
  })
  
  const handleInput = async (event) => {
    event.preventDefault()
    const {value} = event.target.url
    setRequest([value, ...requests])

    await axios.get(`${URL}/info`, {params:{requests: [value]}})
    .then(response => {
      console.log(response)
      setInfo([...response.data.payload, ...info])
    })
    event.target.reset()
  }
  
    function sendMessage(event) {
        if(!requests.length){
          alert("Playlist is Empty")
        } else {
          console.log("Remote Ran")
        event.preventDefault()
        socket.emit("client-message", {
            id: event.target.id,
            requests: requests
        })
        }
        
    
      }

      function handleDelete(event){
        event.preventDefault()
        const {id} = event.target
        setRequest(requests.filter((url, i) => i !== Number(id)))
        setInfo(info.filter((url, i) => i !== Number(id)))
      }

      function handlePasswordChange(event) {
        setAuth({success: false, password: event.target.value})
      }

      // console.log(info)
    return (
        <div className="container">
          {auth.success === false ? <>
            <input onChange={handlePasswordChange} type="text" name="" id="" required/>
            <input onClick={() => handleClientConnect(auth.password)} type="submit" />
          </> : <>
            <div className="controls">
              <form onSubmit={handleInput} action="">
                  <input name="url" type="text" placeholder="Share Youtube URL" required/>
                  <button type="submit" id="add">Add to this Playlist</button>
              </form>   
              <button id="send" onClick={sendMessage}>Play this Playlist</button>
              <button id="next" onClick={sendMessage}>Next</button>
              <button id="prev" onClick={sendMessage}>previous</button>
            </div>
              <div className="cards">
                {info.map((info, i) => {
                console.log(info)
                return(
                  <div key={i} className="preview-card" >
                  <img id={i} src={info.thumbnail} alt="" onClick={sendMessage}/>
                  <h3 id={i} onClick={sendMessage}>{info.title}</h3>
                  <button id={i} onClick={handleDelete}>Delete</button>
                  <hr />
                  </div>
                )
              })}
              </div>
            </>}
            
        </div>
       
    )
}

export default App
