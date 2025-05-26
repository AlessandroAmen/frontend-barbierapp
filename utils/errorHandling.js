export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

export const handleAPIError = (error) => {
  if (error instanceof APIError) {
    console.error(`API Error (${error.status}):`, error.message);
    if (error.status === 401) {
      // Handle unauthorized
      return "Sessione scaduta. Effettua nuovamente il login.";
    } else if (error.status === 404) {
      return "Risorsa non trovata.";
    } else if (error.status >= 500) {
      return "Errore del server. Riprova più tardi.";
    }
    return error.message;
  }
  
  if (error.name === 'AbortError') {
    return "Richiesta interrotta per timeout. Il server sta impiegando troppo tempo a rispondere.";
  }

  if (error.message === 'Network request failed') {
    return "Impossibile raggiungere il server. Verifica la tua connessione.";
  }
  
  return "Si è verificato un errore imprevisto: " + error.message;
};
