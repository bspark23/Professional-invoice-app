
import { useState, useEffect } from "react";
import { Client, ClientFormData } from "@/types/client";
import { useToast } from "@/hooks/use-toast";

export const useClients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const savedClients = localStorage.getItem('invoicer-pro-clients');
    if (savedClients) {
      try {
        const parsed = JSON.parse(savedClients);
        setClients(parsed);
      } catch (error) {
        console.log('Error loading saved clients:', error);
      }
    }
  }, []);

  const saveClients = (clientList: Client[]) => {
    setClients(clientList);
    localStorage.setItem('invoicer-pro-clients', JSON.stringify(clientList));
  };

  const addClient = (clientData: ClientFormData) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const updatedClients = [...clients, newClient];
    saveClients(updatedClients);
    
    toast({
      title: "Client Added",
      description: "Client has been saved successfully.",
    });

    return newClient;
  };

  const updateClient = (id: string, clientData: ClientFormData) => {
    const updatedClients = clients.map(client =>
      client.id === id ? { ...client, ...clientData } : client
    );
    saveClients(updatedClients);
    
    toast({
      title: "Client Updated",
      description: "Client information has been updated.",
    });
  };

  const deleteClient = (id: string) => {
    const updatedClients = clients.filter(client => client.id !== id);
    saveClients(updatedClients);
    
    toast({
      title: "Client Deleted",
      description: "Client has been removed successfully.",
    });
  };

  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  return {
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
  };
};
