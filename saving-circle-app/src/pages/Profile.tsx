
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const handleUpdate = () => {
    updateProfile({ name, avatar });
    setIsEditing(false);
  };
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Manage your personal details
              </CardDescription>
            </div>
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar || undefined} alt={user?.name} />
              <AvatarFallback className="bg-savings-blue-100 text-savings-blue-700 text-xl">
                {user?.name ? getInitials(user.name) : <UserCircle />}
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL (Optional)</Label>
                  <Input
                    id="avatar"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleUpdate}>Save Changes</Button>
                  <Button variant="outline" onClick={() => {
                    setName(user?.name || '');
                    setAvatar(user?.avatar || '');
                    setIsEditing(false);
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="text-sm font-medium text-gray-500">Full Name</div>
                  <div>{user?.name}</div>
                  
                  <div className="text-sm font-medium text-gray-500">Email Address</div>
                  <div>{user?.email}</div>
                </div>
                
                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-medium mb-1">Security</h3>
              <p className="text-sm text-gray-500 mb-3">Manage your password and account security</p>
              <Button variant="outline" disabled>Change Password</Button>
            </div>
            
            <div className="border-b pb-4">
              <h3 className="font-medium mb-1">Notifications</h3>
              <p className="text-sm text-gray-500 mb-3">Configure how you receive updates</p>
              <Button variant="outline" disabled>Notification Settings</Button>
            </div>
            
            <div>
              <h3 className="font-medium text-destructive mb-1">Danger Zone</h3>
              <p className="text-sm text-gray-500 mb-3">Permanently delete your account and all data</p>
              <Button variant="destructive" disabled>Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
