import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { supabase } from '../lib/supabase';
import ListItem from '../components/ListItem';
import { PostgrestBuilder } from '@supabase/postgrest-js';

type ItemType = {
  id: string;
  thumbnail_image: string;
  title: string;
  description: string;
  site_address: string;
  star_rating: number;
  upvotes: number;
};

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

export default function Home() {
  const [data, setData] = useState<ItemType[]>([]);

  useEffect(() => { 
    async function fetchData() {
      const { data, error } = await supabase
        .from('websites')
        .select('*');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        //print data to console
        console.log(data);
        setData(data as ItemType[]);
      }
    }
    fetchData();
  }, []);

  const handleUpvote = async (id: string) => {
    const { data, error } = await supabase
      .from('websites')
      .update({ upvotes: PostgrestBuilder.raw('upvotes + 1') })
      .eq('id', id);
  
    if (error) {
      console.error('Error upvoting:', error);
    } else {
      setData(data ? (data as ItemType[]) : []);
    }
  };

  return (
    <div>
      <h1>Bookmark Gallery</h1>
      <ListContainer>
        {data.map((item) => (
          <ListItem key={item.id} item={item} onUpvote={handleUpvote} />
        ))}
      </ListContainer>
    </div>
  );
}
