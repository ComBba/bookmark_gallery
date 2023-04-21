import styled from '@emotion/styled';
import UpvoteButton from './UpvoteButton';

const ListItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
  margin: 16px;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: auto;
`;

const Title = styled.h3`
  margin: 8px 0;
`;

const Description = styled.p`
  margin: 8px 0;
`;

const SiteAddress = styled.a`
  margin: 8px 0;
`;

const StarRating = styled.span`
  margin: 8px 0;
`;

const ListItem = ({ item, onUpvote }) => {
  return (
    <ListItemWrapper>
      <Thumbnail src={item.thumbnail_image} alt={item.title} />
      <Title>{item.title}</Title>
      <Description>{item.description}</Description>
      <SiteAddress href={item.site_address} target="_blank" rel="noopener noreferrer">{item.site_address}</SiteAddress>
      <StarRating>Rating: {item.star_rating}</StarRating>
      <UpvoteButton upvotes={item.upvotes} onUpvote={() => onUpvote(item.id)} />
    </ListItemWrapper>
  );
};

export default ListItem;
