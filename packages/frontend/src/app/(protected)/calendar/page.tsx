"use client";

import { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Users,
  MapPin,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { cn } from "../../../lib/utils";
import {
  EventType,
  EventStatus,
  CalendarEvent,
} from "../../../models/CalendarEvent";
import GetAllEventsAPI from "../../../../api/engineer/GetAllEvents";
import GetClientsAPI from "../../../../api/engineer/GetClients";
import { Client } from "../../../models/Client";

// Event type configuration for styling and icons
const EVENT_TYPES = {
  [EventType.VISIT]: {
    label: "Visita",
    icon: Users,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  [EventType.MEETING]: {
    label: "Reunião",
    icon: Users,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  [EventType.REPORT]: {
    label: "Relatório",
    icon: FileText,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  [EventType.APPLICATION]: {
    label: "Aplicação",
    icon: FileText,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  [EventType.COLLECTION]: {
    label: "Coleta",
    icon: FileText,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: "",
    date: new Date(selectedDate),
    time: "09:00",
    clientId: "",
    location: "",
    description: "",
    type: EventType.VISIT,
    status: EventStatus.PENDING,
  });

  // Buscar eventos do engenheiro ao carregar a página
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const eventsData = await GetAllEventsAPI();
        if (eventsData) {
          // Converter strings de data para objetos Date
          const formattedEvents = eventsData.map((event) => ({
            ...event,
            date:
              event.date instanceof Date ? event.date : new Date(event.date),
          }));
          setEvents(formattedEvents);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Buscar lista de clientes ao carregar a página
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await GetClientsAPI();
        if (clientsData) {
          setClients(clientsData);
        } else {
          setClients([]);
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        setClients([]);
      }
    };

    fetchClients();
  }, []);

  // Calendar navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Get days for the current month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter events based on active filters
  const filteredEvents =
    activeFilters.length > 0
      ? events.filter((event) => activeFilters.includes(event.type))
      : events;

  // Get events for the selected date
  const selectedDateEvents = filteredEvents.filter((event) =>
    isSameDay(event.date, selectedDate)
  );

  // Toggle event type filter
  const toggleFilter = (type: string) => {
    if (activeFilters.includes(type)) {
      setActiveFilters(activeFilters.filter((t) => t !== type));
    } else {
      setActiveFilters([...activeFilters, type]);
    }
  };

  // Check if a day has events
  const dayHasEvents = (day: Date) => {
    return filteredEvents.some((event) => isSameDay(event.date, day));
  };

  // Handle adding a new event
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;

    const fullEvent: CalendarEvent = {
      title: newEvent.title || "",
      type: newEvent.type || EventType.VISIT,
      status: newEvent.status || EventStatus.PENDING,
      date: newEvent.date as Date,
      time: newEvent.time || "09:00",
      clientId: newEvent.clientId,
      location: newEvent.location,
      description: newEvent.description,
    };

    setEvents([...events, fullEvent]);
    setIsAddEventOpen(false);
    setNewEvent({
      title: "",
      date: new Date(selectedDate),
      time: "09:00",
      clientId: "",
      location: "",
      description: "",
      type: EventType.VISIT,
      status: EventStatus.PENDING,
    });
  };

  return (
    <div className="space-y-6 pb-16 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl">Calendário</h1>
          <p className="text-mediumGray">
            Gerencie suas atividades e compromissos
          </p>
        </div>
        <div className="flex gap-2">
          <Popover>
            {/* BOTAO FILTRAR */}
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
                {activeFilters.length > 0 && (
                  <Badge className="ml-2 bg-primaryGreen text-white">
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>

            {/* POPOVER TIPOS DE EVENTO */}
            <PopoverContent className="w-56 p-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Tipos de Evento</h4>
                <div className="space-y-1">
                  {Object.entries(EVENT_TYPES).map(([type, config]) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`filter-${type}`}
                        checked={
                          activeFilters.length === 0 ||
                          activeFilters.includes(type)
                        }
                        onChange={() => toggleFilter(type)}
                        className="mr-2 accent-primaryGreen"
                      />
                      <label
                        htmlFor={`filter-${type}`}
                        className="text-sm flex items-center"
                      >
                        <config.icon className="mr-1 h-3 w-3" />
                        {config.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            {/* BOTAO NOVO EVENTO */}
            <DialogTrigger asChild>
              <Button className="bg-primaryGreen hover:bg-lightGreen">
                <Plus className="mr-2 h-4 w-4" />
                Novo Evento
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Evento</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do evento para adicioná-lo ao calendário.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-title" className="text-right">
                    Título
                  </Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-type" className="text-right">
                    Tipo
                  </Label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, type: value as EventType })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EVENT_TYPES).map(([type, config]) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center">
                            <config.icon className="mr-2 h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-date" className="text-right">
                    Data
                  </Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={format(newEvent.date as Date, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        date: new Date(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-time" className="text-right">
                    Hora
                  </Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-client" className="text-right">
                    Cliente
                  </Label>
                  <Select
                    value={newEvent.clientId}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, clientId: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-location" className="text-right">
                    Local
                  </Label>
                  <Input
                    id="event-location"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-description" className="text-right">
                    Descrição
                  </Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddEventOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-primaryGreen hover:bg-lightGreen"
                  onClick={handleAddEvent}
                  disabled={!newEvent.title || !newEvent.date}
                >
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">
                {format(currentDate, "MMMM yyyy", { locale: ptBR })}
              </CardTitle>
              <CardDescription>
                Selecione uma data para ver ou adicionar eventos
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Calendar header - days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div key={day} className="text-center text-sm font-medium py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Generate empty cells for days before the start of the month */}
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div
                  key={`empty-start-${index}`}
                  className="h-14 p-1 rounded-md"
                ></div>
              ))}

              {/* Days of the month */}
              {monthDays.map((day) => {
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                const hasEvents = dayHasEvents(day);

                return (
                  <button
                    key={day.toString()}
                    className={cn(
                      "h-14 p-1 rounded-md relative transition-colors",
                      !isSameMonth(day, currentDate) && "text-muted-foreground",
                      isToday && "bg-muted",
                      isSelected &&
                        "bg-primaryGreen/10 text-primaryGreen font-medium",
                      hasEvents &&
                        !isSelected &&
                        "border border-primaryGreen/30",
                      "hover:bg-muted"
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      className="text-sm"
                    >
                      {format(day, "d")}
                    </time>
                    {hasEvents && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        <div className="h-1 w-1 rounded-full bg-primaryGreen"></div>
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Generate empty cells for days after the end of the month */}
              {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
                <div
                  key={`empty-end-${index}`}
                  className="h-14 p-1 rounded-md"
                ></div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events for selected date */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5" />
              {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length > 0
                ? `${selectedDateEvents.length} evento${
                    selectedDateEvents.length > 1 ? "s" : ""
                  }`
                : "Nenhum evento para esta data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p>Nenhum evento agendado para esta data.</p>
                  <p className="text-sm mt-2">
                    Clique em &quot;Novo Evento&quot; para adicionar.
                  </p>
                </div>
              ) : (
                selectedDateEvents.map((event, index) => {
                  const EventIcon =
                    EVENT_TYPES[event.type]?.icon || CalendarIcon;
                  const eventColor =
                    EVENT_TYPES[event.type]?.color ||
                    "bg-gray-100 text-gray-800 border-gray-200";

                  // Encontrar o cliente pelo ID
                  const client = clients.find((c) => c.id === event.clientId);

                  return (
                    <div
                      key={`${event.title}-${index}`}
                      className="flex items-start gap-3 p-3 rounded-md border border-mediumGray/20"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          eventColor.split(" ")[0]
                        }`}
                      >
                        <EventIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant="outline" className={eventColor}>
                            {EVENT_TYPES[event.type]?.label || "Evento"}
                          </Badge>
                        </div>
                        {event.clientId && (
                          <p className="text-sm text-mediumGray">
                            Cliente: {client ? client.name : event.clientId}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-primaryGreen mt-1">
                          <span>{event.time}</span>
                          {event.location && (
                            <>
                              <span className="mx-1">•</span>
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                        {event.status && (
                          <Badge
                            className={`mt-2 ${
                              event.status === EventStatus.COMPLETED
                                ? "bg-green-100 text-green-800"
                                : event.status === EventStatus.CANCELLED
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {event.status}
                          </Badge>
                        )}
                        {event.description && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setNewEvent({
                  ...newEvent,
                  date: new Date(selectedDate),
                });
                setIsAddEventOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Evento
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Upcoming events */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>
            Eventos agendados para os próximos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredEvents
              .filter((event) => event.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 3)
              .map((event, index) => {
                const EventIcon = EVENT_TYPES[event.type]?.icon || CalendarIcon;
                const eventColor =
                  EVENT_TYPES[event.type]?.color ||
                  "bg-gray-100 text-gray-800 border-gray-200";

                return (
                  <Card
                    key={`upcoming-${index}`}
                    className="border border-mediumGray/20"
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">
                          {event.title}
                        </CardTitle>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            eventColor.split(" ")[0]
                          }`}
                        >
                          <EventIcon className="h-4 w-4" />
                        </div>
                      </div>
                      <CardDescription>
                        {event.clientId
                          ? `Cliente: ${
                              clients.find((c) => c.id === event.clientId)
                                ?.name || event.clientId
                            }`
                          : "Sem cliente"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center text-xs text-primaryGreen mt-1">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>{format(event.date, "dd/MM/yyyy")}</span>
                        <span className="mx-1">•</span>
                        <span>{event.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.status && (
                        <Badge
                          className={`mt-2 ${
                            event.status === EventStatus.COMPLETED
                              ? "bg-green-100 text-green-800"
                              : event.status === EventStatus.CANCELLED
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {event.status}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
