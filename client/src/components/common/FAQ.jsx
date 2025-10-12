import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

export default function FAQ({ QnA }) {
  const [search, setSearch] = useState('');

  const filteredQnA = QnA.filter(
    item =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TextField
        label="Search FAQs"
        variant="outlined"
        fullWidth
        margin="normal"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Type keywords..."
      />
      {filteredQnA.length === 0 ? (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          No FAQs found.
        </Typography>
      ) : (
        filteredQnA.map((item, index) => (
          <Accordion key={index}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index + 1}-content`}
              id={`panel${index + 1}-header`}
            >
              <Typography component="span">Q: {item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography component="span">Ans: {item.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </div>
  );
}