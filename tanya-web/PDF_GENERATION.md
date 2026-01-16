# PDF Generation Guide

This guide explains how to generate PDFs from HTML content with dynamic height in the Tanya web application.

## Overview

The PDF generation system uses `html2pdf.js` to convert HTML content into PDF files. This approach offers:

- **Dynamic height**: PDFs automatically adjust to content size
- **Easy design**: Design PDFs using familiar HTML/CSS
- **RTL support**: Full Hebrew right-to-left text support
- **Page break control**: Control where pages break
- **Preview capability**: Preview PDFs before downloading

## Files

- `src/utils/htmlToPdf.js` - Core PDF generation utilities
- `src/components/PdfTemplate.jsx` - React components for PDF templates
- `src/components/TanyaPdfExample.jsx` - Example implementations

## Basic Usage

### Simple Example

```jsx
import PdfTemplate, { PdfPage } from './components/PdfTemplate';

function MyComponent() {
  return (
    <PdfTemplate>
      {(generatePdf, previewPdf) => (
        <div>
          <button onClick={() => generatePdf({ filename: 'my-document.pdf' })}>
            Download PDF
          </button>
          
          <PdfPage>
            <h1>My Document Title</h1>
            <p>This content will be converted to PDF</p>
          </PdfPage>
        </div>
      )}
    </PdfTemplate>
  );
}
```

## Components

### PdfTemplate

Main wrapper component that provides PDF generation functions.

**Props:**
- `children` - Function that receives `(generatePdf, previewPdf)` or regular children

**Example:**
```jsx
<PdfTemplate>
  {(generatePdf, previewPdf) => (
    <div>
      {/* Your content and buttons */}
    </div>
  )}
</PdfTemplate>
```

### PdfPage

Wrapper for a single PDF page with A4 dimensions and Hebrew RTL support.

**Props:**
- `children` - Content to display
- `style` - Optional additional styles

**Default styling:**
- Width: 210mm (A4)
- Min height: 297mm (A4)
- Padding: 20mm
- Direction: RTL (for Hebrew)
- Font: Arial

### PdfSection

Section wrapper with page break control.

**Props:**
- `children` - Content
- `avoidBreak` - Prevent page breaks inside section (default: true)
- `style` - Additional styles

### PdfPageBreak

Force a page break at this point.

```jsx
<PdfPageBreak />
```

## API Functions

### generatePdfFromHtml(element, options)

Generate PDF from HTML element.

**Parameters:**
- `element` (HTMLElement) - Element to convert
- `options` (Object):
  - `filename` - Output filename (default: 'document.pdf')
  - `pageSize` - Page size: 'a4', 'letter', etc (default: 'a4')
  - `margin` - Margin in mm (default: 10)
  - `orientation` - 'portrait' or 'landscape' (default: 'portrait')

**Returns:** Promise<Blob>

### previewPdfFromHtml(element)

Preview PDF in new window.

**Parameters:**
- `element` (HTMLElement) - Element to preview

### generatePdfFromHtmlString(htmlString, options)

Generate PDF from HTML string.

**Parameters:**
- `htmlString` (string) - HTML content
- `options` (Object) - Same as generatePdfFromHtml

## Advanced Examples

### Certificate with Custom Styling

```jsx
<PdfTemplate>
  {(generatePdf) => (
    <div>
      <button onClick={() => generatePdf({ 
        filename: 'certificate.pdf',
        margin: 20 
      })}>
        Download Certificate
      </button>

      <PdfPage style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold' }}>
            תעודת הצטיינות
          </h1>
          <p style={{ fontSize: '24px', marginTop: '30px' }}>
            מוענקת ל{userName}
          </p>
        </div>
      </PdfPage>
    </div>
  )}
</PdfTemplate>
```

### Multi-page Report with Sections

```jsx
<PdfTemplate>
  {(generatePdf, previewPdf) => (
    <div>
      <button onClick={() => generatePdf({ 
        filename: 'report.pdf',
        pageSize: 'a4',
        orientation: 'portrait'
      })}>
        Download Report
      </button>
      <button onClick={previewPdf}>Preview</button>

      <PdfPage>
        {/* Page 1 */}
        <PdfSection avoidBreak={true}>
          <h1>Summary</h1>
          <p>Overview content...</p>
        </PdfSection>

        <PdfPageBreak />

        {/* Page 2 */}
        <PdfSection avoidBreak={false}>
          <h2>Details</h2>
          {items.map(item => (
            <PdfSection key={item.id} avoidBreak={true}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </PdfSection>
          ))}
        </PdfSection>
      </PdfPage>
    </div>
  )}
</PdfTemplate>
```

### Progress Report for Tanya Groups

```jsx
import TanyaPdfExample from './components/TanyaPdfExample';

function GroupReport({ group }) {
  const groupData = {
    name: group.name,
    dedicatedTo: group.dedicatedTo,
    book: group.book, // completed parts array
    max: group.max,
    inProgress: group.inProgress,
    booksReaded: group.booksReaded
  };

  return <TanyaPdfExample groupData={groupData} />;
}
```

## Styling Tips

### Use Inline Styles

For best results, use inline styles rather than CSS classes:

```jsx
// Good ✓
<h1 style={{ fontSize: '24px', color: '#027EC5' }}>Title</h1>

// Avoid ✗
<h1 className="title">Title</h1>
```

### RTL Content

Hebrew content is automatically RTL when using `PdfPage`:

```jsx
<PdfPage>
  <p>טקסט בעברית יופיע מימין לשמאל</p>
</PdfPage>
```

### Page Breaks

Control page breaks with CSS or components:

```jsx
// Force break after element
<div style={{ pageBreakAfter: 'always' }}>Content</div>

// Avoid breaks inside element
<div style={{ pageBreakInside: 'avoid' }}>Content</div>

// Use component
<PdfPageBreak />
```

## Troubleshooting

### PDF is blank
- Make sure content is inside `PdfPage` or a div with explicit dimensions
- Check that buttons are positioned absolutely or fixed (they shouldn't be in PDF content)

### Layout issues
- Use inline styles instead of CSS classes
- Test with preview before downloading
- Check that dimensions are in absolute units (px, mm, pt)

### Hebrew text issues
- Ensure `PdfPage` is used (has RTL by default)
- Add `direction: 'rtl'` to style prop if needed

### Images not appearing
- Images must be loaded before PDF generation
- Use absolute URLs for images
- Set `useCORS: true` in html2canvas options (already configured)

## Integration with Existing Code

To add PDF export to the Reader page:

1. Import the utilities:
```jsx
import { generatePdfFromHtml } from '../utils/htmlToPdf';
```

2. Create a ref for content:
```jsx
const contentRef = useRef(null);
```

3. Add export function:
```jsx
const exportToPdf = async () => {
  await generatePdfFromHtml(contentRef.current, {
    filename: `${group.name}-part-${part}.pdf`,
    margin: 15
  });
};
```

4. Wrap content and add button:
```jsx
<button onClick={exportToPdf}>Export to PDF</button>
<div ref={contentRef}>
  {/* Content to export */}
</div>
```

## Performance Notes

- PDF generation is CPU-intensive; show loading indicator
- Large PDFs (many pages) may take several seconds
- Preview is faster than download for testing
- Consider lazy loading the html2pdf.js library

## License

This implementation uses html2pdf.js which is MIT licensed.
