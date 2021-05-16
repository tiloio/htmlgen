export class MissingTemplateError extends Error {
  constructor(public templateId: string, public page: string) {
    super(
      `🛑 Could not find the template 'templates.${templateId}' in the page '${page}'.
   Make sure you created a '${templateId}.html' in the templates directory.`
    );
  }
}
