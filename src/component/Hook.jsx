import axios from "axios"
const { useState, useEffect } = require("react")


const useFetch=(url)=>{
    const[loading,setLoading] = useState(false)
    const [data,setData] = useState([])
    
const fetchdata= async()=>{
  
}
    useEffect(()=>{
        setLoading(true)
         axios.get(url)
         .then((res)=>{
            setData(res.data)
            setLoading(false)
         }).catch((error)=>{
            setLoading(false)
            console.log(error)
         })
    },[url])

    return [loading,data,error]
}

export {useFetch}