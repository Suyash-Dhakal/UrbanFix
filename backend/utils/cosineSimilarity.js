import {getEmbeddings} from './getEmbeddings.js';
import similarity from 'compute-cosine-similarity';


export const cosineSimilarity = async (text1, text2) => {    
    const embedding1=await getEmbeddings(text1);
    const embedding2=await getEmbeddings(text2);
    const similarityScore = similarity(embedding1, embedding2);
    
    return similarityScore;
}

//for faster cosine similarity calculation, use fast-cosine-similarity npm package



