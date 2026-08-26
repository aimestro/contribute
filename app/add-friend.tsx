import { useRouter } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Screen } from '@/components/ui/Screen';
import { useStore } from '@/lib/store';

export default function AddFriendScreen() {
  const router = useRouter();
  const { addFriend } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <Screen>
      <Field
        label="Name"
        placeholder="Friend's name"
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <Field
        label="Email (optional)"
        placeholder="friend@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Button
        label="Add friend"
        disabled={!name.trim()}
        onPress={() => {
          const person = addFriend(name, email);
          router.replace(`/friend/${person.id}`);
        }}
      />
    </Screen>
  );
}
