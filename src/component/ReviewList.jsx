import { Flex, Text ,Heading, Box, Avatar, Spinner} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
// import { data } from './db'
import ReviewHighlight from './ReviewHighlight'

const ReviewList = () => {
	const [loading,setLoading] = useState(false)
	const [data,setData] = useState([])
	const fetchdata=async()=>{
		try{
			setLoading(true)
			const data =await axios.get(`https://review-backend-hqyh.onrender.com/data`)
			setLoading(false)
			console.log(data.data)
			setData(data.data)
		}catch(error){
			setLoading(false)
           console.log(error)
		}
	}
	useEffect(()=>{
		fetchdata()
	},[])
  return (
    <div>
        {
           data.length>0 ?(data.map((e)=>(
                  <Flex p='10px' margin={{base:"5px",md:"10px",lg:"20px"}} borderBottom={'1px solid black'} flexDir={'column'} gap={'5px'}>
                    <Flex alignItems={"center"} gap="10px" >
					<Box>
						<Avatar size="sm" name={e.reviewer_name} />
					</Box>
					<Box >
						<Text
                        textAlign={'left'}
							fontSize={"18px"}
							textTransform={"capitalize"}
							fontWeight={"600"}
						>
							{e.reviewer_name}
						</Text>
						<Text textAlign={'left'} fontSize={"16px"} color={"gray"} mt={"-3px"}>
							{`Published on ${e.date}`}
						</Text>
					</Box>
				</Flex>
                    <Box ml='30px'>
                    <ReviewHighlight review={e}/>
                    </Box>
                   
                </Flex>
            ))
		):(
		  <Box mt='20px'>
			<Spinner/>
			<Text>Apology for delay Reviews are being loaded....</Text>
		  </Box>
		)
        }
	
       
    </div>
  )
}

export default ReviewList