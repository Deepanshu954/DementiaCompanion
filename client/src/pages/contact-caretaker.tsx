
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CaretakerProfile } from "@/components/dashboard/caretaker-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { MapPin } from "lucide-react";

export default function ContactCaretakerPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  
  const { data: caretaker } = useQuery({
    queryKey: [`/api/caretakers/${id}`],
    staleTime: 1000 * 60 * 5,
  });

  const { data: location } = useQuery({
    queryKey: [`/api/caretakers/${id}/location`],
    enabled: !!caretaker?.providesLiveLocation,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caretakerId: Number(id) })
      });
      if (!response.ok) throw new Error('Failed to connect with caretaker');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Connected Successfully",
        description: "The caretaker has been notified and will review your request."
      });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/caretakers/${id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the caretaker."
      });
      setMessage("");
    }
  });

  if (!caretaker) return null;

  return (
    <div className="container py-8">
      <Card className="mb-6">
        <CardContent className="p-6">
          <CaretakerProfile caretaker={caretaker} showActions={false} />
        </CardContent>
      </Card>

      {location && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-primary-600">
              <MapPin className="h-5 w-5" />
              <h3 className="font-medium">Current Location</h3>
            </div>
            <p className="mt-2 text-neutral-600">{location.address}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Send Message</h3>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            className="mb-4"
          />
          <Button 
            onClick={() => sendMessageMutation.mutate()}
            disabled={!message || sendMessageMutation.isPending}
          >
            Send Message
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Connect with Caretaker</h3>
          <p className="text-neutral-600 mb-4">
            Connecting with this caretaker will allow them to manage your medications and tasks.
          </p>
          <Button 
            onClick={() => connectMutation.mutate()}
            disabled={connectMutation.isPending}
          >
            Connect with Caretaker
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
