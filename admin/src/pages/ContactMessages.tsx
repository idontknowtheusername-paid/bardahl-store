import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Mail, MessageSquare, Send, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/lib/types';

type ContactMessage = Tables<'contact_messages'>;

export default function ContactMessages() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'in_progress' | 'replied' | 'closed'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contact-messages', page, search, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('contact_messages')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,subject.ilike.%${search}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;

      return { messages: data || [], total: count || 0 };
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, reply }: { id: string; reply: string }) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          admin_reply: reply,
          status: 'replied',
          replied_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      toast.success('Réponse enregistrée');
      setSelectedMessage(null);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'replied' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
      toast.success('Marqué comme lu');
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages de contact</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email, nom, sujet..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">Tous</option>
              <option value="new">Nouveaux</option>
              <option value="in_progress">En cours</option>
              <option value="replied">Répondus</option>
              <option value="closed">Fermés</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : !data?.messages.length ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun message trouvé</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.messages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{message.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {message.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{message.subject}</TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                          {message.message}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(message.created_at)}
                      </TableCell>
                      <TableCell>
                        {message.status === 'replied' ? (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Répondu
                          </Badge>
                        ) : message.status === 'in_progress' ? (
                          <Badge className="bg-blue-500">
                            <Clock className="h-3 w-3 mr-1" />
                            En cours
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Nouveau
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMessage(message)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Voir
                          </Button>
                          {(message.status === 'new' || message.status === 'in_progress') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(message.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} sur {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message de {selectedMessage?.name}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <MessageDetail
              message={selectedMessage}
              onReply={(reply) => replyMutation.mutate({ id: selectedMessage.id, reply })}
              isReplying={replyMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageDetail({
  message,
  onReply,
  isReplying,
}: {
  message: ContactMessage;
  onReply: (reply: string) => void;
  isReplying: boolean;
}) {
  const [reply, setReply] = useState(message.admin_reply || '');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          {message.email}
        </div>
        <div className="text-sm text-muted-foreground">
          {formatDate(message.created_at)}
        </div>
      </div>

      <div>
        <Label>Sujet</Label>
        <p className="font-medium mt-1">{message.subject}</p>
      </div>

      <div>
        <Label>Message</Label>
        <div className="mt-1 p-3 rounded-lg bg-muted">
          <p className="whitespace-pre-wrap">{message.message}</p>
        </div>
      </div>

      {message.admin_reply && (
        <div>
          <Label>Votre réponse</Label>
          <div className="mt-1 p-3 rounded-lg bg-primary/10">
            <p className="whitespace-pre-wrap">{message.admin_reply}</p>
          </div>
          {message.replied_at && (
            <p className="text-xs text-muted-foreground mt-1">
              Répondu le {formatDate(message.replied_at)}
            </p>
          )}
        </div>
      )}

      {(message.status === 'new' || message.status === 'in_progress') && (
        <div>
          <Label htmlFor="reply">Répondre</Label>
          <Textarea
            id="reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Votre réponse..."
            rows={5}
            className="mt-1"
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={() => onReply(reply)}
              disabled={!reply.trim() || isReplying}
            >
              <Send className="h-4 w-4 mr-2" />
              {isReplying ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
