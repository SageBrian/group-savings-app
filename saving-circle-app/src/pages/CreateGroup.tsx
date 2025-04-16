
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useSavings } from '@/contexts/SavingsContext';
import { AlertCircle } from 'lucide-react';

const CreateGroup = () => {
  const navigate = useNavigate();
  const { createGroup } = useSavings();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.targetAmount) {
      newErrors.targetAmount = 'Target amount is required';
    } else {
      const amount = parseFloat(formData.targetAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.targetAmount = 'Target amount must be a positive number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      createGroup({
        name: formData.name,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
      });
      
      navigate('/groups');
    } catch (error) {
      console.error('Error creating group:', error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Savings Group</h1>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Group Details</CardTitle>
              <CardDescription>
                Create a new savings group and invite others to join
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Group Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="E.g., Holiday Fund, Emergency Savings"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <div className="text-sm text-destructive flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the purpose of this savings group"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && (
                  <div className="text-sm text-destructive flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetAmount">
                  Target Amount ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.targetAmount}
                  onChange={handleChange}
                  className={errors.targetAmount ? 'border-destructive' : ''}
                />
                {errors.targetAmount && (
                  <div className="text-sm text-destructive flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.targetAmount}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/groups')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Group'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateGroup;
