import { Box, Tooltip } from '@chakra-ui/react';
import React from 'react';

const ReviewHighlight = ({ review }) => {
  const highlightSentences = (content, highlightIndices) => {
   // console.log(topic,'topic')

    let highlightedContent = [];
    let currentIndex = 0;

    highlightIndices[0].highlight_indices.forEach(([start, end, sentiment]) => {
      const beforeHighlight = content.substring(currentIndex, start);
      const highlighted = content.substring(start, end + 1);
      currentIndex = end + 1;

      highlightedContent.push(
        <React.Fragment key={currentIndex}>
          {beforeHighlight && <span>{beforeHighlight}</span>}
          {highlighted && (
            <Tooltip label={review.analytics[0].topic} key={currentIndex}>
              <span style={{ backgroundColor: getColor(sentiment) }}>{highlighted}</span>
            </Tooltip>
          )}
        </React.Fragment>
      );
    });

    const remainingContent = content.substring(currentIndex);
    highlightedContent.push(<span key={currentIndex}>{remainingContent}</span>);

    return highlightedContent;
  };

  const getColor = (sentiment) => {
    switch (sentiment) {
      case 'Positive':
        return '#D9F2DD';
      case 'Negative':
        return '#F2DBD9';
      case 'Mixed':
        return '#e8bd6d3d';
      case 'Neutral':
        return '#eaf09b6b';
      default:
        return 'transparent';
    }
  };

  

  return (
    <>
      {review.analytics.length > 0 ? (
      
          <Box textAlign={'left'}>
            {highlightSentences(review.content,review.analytics).map((element, index) => (
              <React.Fragment key={index}>{element}</React.Fragment>
            ))}
          </Box>
        
      ) : (
        <Box textAlign={'left'}>{review.content}</Box>
      )}
    </>
  );
};

export default ReviewHighlight;
