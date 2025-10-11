import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function FAQ({ QnA }) {
  return (
    <div>
      {QnA.map((item, index) => (
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
      ))}
    </div>
  );
}