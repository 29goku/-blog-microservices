import CreateUserForm from './CreateUserForm';

interface UserFormProps {
  onUserCreated: () => void;
}

export default function UserForm({ onUserCreated }: UserFormProps) {
  return <CreateUserForm onUserCreated={onUserCreated} />;
}
