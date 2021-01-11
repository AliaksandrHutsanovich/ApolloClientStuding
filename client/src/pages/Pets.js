import React, {useState} from 'react'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import PetsList from '../components/PetsList'
import NewPetModal from '../components/NewPetModal'
import Loader from '../components/Loader'

const PETS_FIELDS = gql`
  fragment PetsFields on Pet {
    id
    name
    img
    vaccinated @client
    owner {
      id
      age @client
    }
  }
`;

const ALL_PETS = gql`
  query AllPets {
    pets {
      ...PetsFields
    }
  }
  ${PETS_FIELDS}
`;

// @client means that we have on the frontend the same schema as on backend but with aditional field age

const CREATE_PET = gql`
  mutation CreateAPet($newPet: NewPetInput!) {
    addPet(input: $newPet) {
      ${PETS_FIELDS}
    }
  }
`;

const GET_PET = gql`
  query OnePet {
    pet {
      id
      name
      img
    }
  }
`;

const UPDATE_PET = gql`
  mutation UpdatePet($newPet: NewPetInput!) {
    updatePet(input: $newPet) {
      id
      name
      type
      img
    }
  }
`;

export default function Pets () {
  const [modal, setModal] = useState(false);
  const { data, loading, error } = useQuery(ALL_PETS);
  const [
    createPet,
    { data: mutationData, loading: isLoading, error: mutationError },
  ] = useMutation(
    CREATE_PET, {
      update(cache, { data: { addPet } }) {
        const { pets } = cache.readQuery({ query: ALL_PETS });
        cache.writeQuery({
          query: ALL_PETS,
          data: { pets: pets.concat([addPet]) }
        });
      },
      optimisticResponse: {
        __typename: 'Mutation',
        addPet: {
          id: 'xxx',
          name: 'some',
          img: 'https://via.placeholder.com/300',
          __typename: 'Pet',
        },
      },
    },
  );

  const onSubmit = ({ name, type }) => {
    setModal(false);
    createPet({
      variables: { newPet: { name, type } },
      // here we can add optimisticResponse and this response will be major if to compare between two
    });
  }

  if (loading) {
    return <Loader />
  }

  if (error || mutationError) {
    return <p>Error</p>
  }
  
  console.log(data.pets[0]);
  
  if (modal) {
    return <NewPetModal onSubmit={onSubmit} onCancel={() => setModal(false)} />
  }

  return (
    <div className="page pets-page">
      <section>
        <div className="row betwee-xs middle-xs">
          <div className="col-xs-10">
            <h1>Pets</h1>
          </div>

          <div className="col-xs-2">
            <button onClick={() => setModal(true)}>new pet</button>
          </div>
        </div>
      </section>
      <section>
        <PetsList pets={data.pets} />
      </section>
    </div>
  )
}

//we can add fragment to our component 
//something like Pets.fragment = { petsFields: gql`` } to share them between several components
