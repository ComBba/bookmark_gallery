import styled from '@emotion/styled';

const UpvoteButtonWrapper = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
`;

const UpvoteButton = ({ upvotes, onUpvote }) => {
  return (
    <UpvoteButtonWrapper onClick={onUpvote}>
      <span role="img" aria-label="upvote">
        👍
      </span>{' '}
      {upvotes}
    </UpvoteButtonWrapper>
  );
};

export default UpvoteButton;
