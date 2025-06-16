export const handleApiError = async (error: any) => {
  if (error instanceof Response) {
    try {
      const errorData = await error.json();
      throw new Error(errorData.message || 'Произошла ошибка при выполнении запроса');
    } catch (e) {
      throw new Error(`Ошибка ${error.status}: ${error.statusText}`);
    }
  }
  
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error('Произошла неизвестная ошибка');
}; 