import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { supabase } from '../lib/supabase';
import ListItem from '../components/ListItem';
import { PostgrestBuilder, PostgrestQueryBuilder } from '@supabase/postgrest-js';

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
    // Select a record from the "websites" table where "id" is equal to the given id
    // Step 1: Select the record
    const { data: selectedData, error: selectError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .single();

    // Check if there's an error and if the data exists
    if (selectError) {
      console.error('Error selecting record:', selectError);
      return;
    }

    if (!selectedData) {
      console.error('No data found for the given id:', id);
      return;
    }
    console.log('Selected record:', selectedData);
    console.log('selectedData.upvotes:', selectedData.upvotes);

    // Step 2: Update the record
    const { error: updateError } = await supabase
      .from('websites')
      .update({ upvotes: selectedData.upvotes + 1 })
      .eq('id', id);

    if (updateError) {
      console.error('Error upvoting record:', updateError);
      return;
    }

    // Step 3: Fetch the updated record
    const { data: updatedData, error: fetchError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated record:', fetchError);
      return;
    }
    console.log('Updated record:', updatedData);

    if (updateError) {
      console.error('Error upvoting record:', updateError);
      return;
    } else {
      setData(data ? (data as ItemType[]) : []);
    };
  }

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
