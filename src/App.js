import {io} from "socket.io-client"
import {useState} from "react"
import axios from "axios"
import "./App.css"

const URL = process.env.REACT_APP_API_URL
const socket = io(URL)

function App() {
  const [requests, setRequest] = useState([])
  const [info, setInfo] = useState([])
  
  socket.on('connect', () => {
    console.log("You Connected")
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
        console.log("Remote Ran")
        event.preventDefault()
        socket.emit("client-message", {
            id: event.target.id,
            requests: requests
        })
    
      }

      function handleDelete(event){
        event.preventDefault()
        const {id} = event.target
        setRequest(requests.filter((url, i) => i !== Number(id)))
        setInfo(info.filter((url, i) => i !== Number(id)))
      }

      console.log(info)
    return (
        <div className="container">
          <div className="controls">
            <form onSubmit={handleInput} action="">
                <input name="url" type="text" required/>
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
            
        </div>
       
    )
}

export default App
