<?php

  if (defined('STDIN')) {
    $baseFontSize = $argv[1];
    $scale = $argv[2];
  }

  /* Returns the string of a number from the number itself.
   * Example: 1 returns "one"
   * @param number:Int
   * @return String
   * Credit: https://stackoverflow.com/questions/11500088/php-express-number-in-words
   */
   function convertNumberToWord($num = false) {
     $num = str_replace(array(',', ' '), '' , trim($num));
     if(! $num) {
         return false;
     }
     $num = (int) $num;
     $words = array();
     $list1 = array('', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
         'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
     );
     $list2 = array('', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred');
     $list3 = array('', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion',
         'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quattuordecillion',
         'quindecillion', 'sexdecillion', 'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion'
     );
     $num_length = strlen($num);
     $levels = (int) (($num_length + 2) / 3);
     $max_length = $levels * 3;
     $num = substr('00' . $num, -$max_length);
     $num_levels = str_split($num, 3);
     for ($i = 0; $i < count($num_levels); $i++) {
         $levels--;
         $hundreds = (int) ($num_levels[$i] / 100);
         $hundreds = ($hundreds ? ' ' . $list1[$hundreds] . ' hundred' . ( $hundreds == 1 ? '' : 's' ) . ' ' : '');
         $tens = (int) ($num_levels[$i] % 100);
         $singles = '';
         if ( $tens < 20 ) {
             $tens = ($tens ? ' ' . $list1[$tens] . ' ' : '' );
         } else {
             $tens = (int)($tens / 10);
             $tens = ' ' . $list2[$tens] . ' ';
             $singles = (int) ($num_levels[$i] % 10);
             $singles = ' ' . $list1[$singles] . ' ';
         }
         $words[] = $hundreds . $tens . $singles . ( ( $levels && ( int ) ( $num_levels[$i] ) ) ? ' ' . $list3[$levels] . ' ' : '' );
     } //end for loop
     $commas = count($words);
     if ($commas > 1) {
         $commas = $commas - 1;
     }
     return implode(' ', $words);
 }

 /* Gets the next level down for the scale given the base font size. */
 function getDownRemNumber($baseFontSize, $scale, $number) {

   $divisionResults = $baseFontSize / $scale;

   if ($number >= 2) {

     for ($i = 1; $i < $number; $i += 1) {
       $divisionResults /= $scale;
       // echo "Division Results " . $divisionResults;
     }

   }

   echo "divisionResults / baseFontSize " . ($divisionResults / $baseFontSize);

   return $divisionResults / $baseFontSize;

 }

 function generateVariables($baseFontSize, $scale, $numberOfVars) {

   $output = "";

   $output .= '$scale-default: 1rem;' . "\n";

   $upVariables = "";
   $downVariables = "";

   for ($i = 1; $i <= $numberOfVars; $i += 1) {



     $numberWord = $string = preg_replace('/\s+/', '', convertNumberToWord($i));
     $upVariables .= '$scale-' . $numberWord . '-up: ' . pow($scale, $i) . 'rem;' . "\n";
     $downVariables .= '$scale-' . $numberWord . '-down: ' . getDownRemNumber($baseFontSize, $scale, $i) . 'rem;' . "\n";

   }

   $output .= $upVariables . "\n";
   $output .= $downVariables . "\n";

   return $output;

 }

 function generateProp($cssProp, $numberWord, $direction) {
   return "$cssProp: " . '$scale-' . $numberWord . '-' . strtolower($direction) . ';' . "\n";
 }

 function generateScale($layoutName, $cssProps, $numberWord, $direction) {

   $result = "";


   $result .= "&.$layoutName--". $numberWord . ucfirst($direction) . ' { ' . "\n";

   if (is_array($cssProps)) {
     foreach($cssProps as $prop) {
       $result .= generateProp($prop, $numberWord, $direction);
     }

   } else {
     $result .= generateProp($cssProps, $numberWord, $direction);
   }

   $result .= "}" . "\n";

   return $result;
 }

 function generateLayout($layoutName, $cssProp, $numberOfVars) {
   $output = "";

   $output .= ".$layoutName { " . "\n\n";
     $output .= "&.$layoutName--default {" . "\n";
       $output .= 'padding-top: $scale-default;' . "\n";
     $output .= '}' . "\n";

  $upVariables = "";
  $downVariables = "";


   for ($i = 1; $i <= $numberOfVars; $i += 1) {

     $numberWord = $string = preg_replace('/\s+/', '', convertNumberToWord($i));

     $upVariables .= generateScale($layoutName, $cssProp, $numberWord, "up");
     $downVariables .= generateScale($layoutName, $cssProp, $numberWord, "down");
   }

   $output .= $upVariables . "\n";
   $output .= $downVariables . "\n";

   $output .= '}';

   return $output;
}

$layoutPropList = array(
  "TopSpacer" => "padding-top",
  "HorizontalRightSpacer" => "margin-right",
  "HorizontalLeftSpacer" => "margin-left",
  "BottomSpacer" => "margin-bottom",
  "HorizontalConstrainer" => array("padding-left", "padding-right"),
  "VerticalConstrainer" => array("padding-top", "padding-bottom")
);


$ultimateOutput = "";

foreach ($layoutPropList as $layoutName => $cssProp) {
  $ultimateOutput .= generateLayout($layoutName, $cssProp, 20);
  $ultimateOutput .= "\n\n";
}

$variables = fopen("_variables.scss", "w");
$variablesFileOutput = generateVariables($baseFontSize, $scale, 20);
fwrite($variables, $variablesFileOutput);
fclose($variables);

$layout = fopen("_layout.scss", "w");
$layoutFileOutput = $ultimateOutput;
fwrite($layout, $layoutFileOutput);
fclose($layout);
 // getDownRemNumber(16, 1.272, 2);
?>
