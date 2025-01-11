import { Side} from "../components"

const Profile = () => {
  return (
      <Side position={[2, 0, 0]} rotation={[0, Math.PI / 2, 0]} color="yellow">
        <h2 className="text-xl font-bold">Profile</h2>
      </Side>
  )
}

export default Profile