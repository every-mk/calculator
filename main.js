$(document).ready(function()
{
  $(".calulator_button_list_item").click(function()
  {
    let select_value = $(this).text();
    let result_value = $(".calulator_result").text();
    
    result_value = button_click_control(select_value, result_value)
    $(".calulator_result").text(result_value);
  });
  
  /* 関数: ボタンクリック制御 */
  /* 引数: クリックした値     */
  /*       計算式             */
  /* 戻り値: 計算式           */
  function button_click_control(key, formula)
  {
    switch (key)
    {
      case "AC":
        formula = "0";
        break;
      case "=":
        formula = key_input_control_equal(formula);
        break;
      case ".":
        formula = key_input_control_full_stop(formula);
        break;
      case "-":
      case "+":
      case "*":
      case "/":
        formula = key_input_control_operator(key, formula)
        break;
      default:
        formula = key_input_control_numeric(key, formula);
        break;
    }
    
    return formula;
  }
  
  /* 関数: 「=」入力制御      */
  /* 引数: 計算式             */
  /* 戻り値: 計算式           */
  function key_input_control_equal(formula)
  {
    if (check_formula_complete(formula))
    {
      formula = calculation_control(formula);
    }
    
    return formula;
  }
  
  /* 関数: 「.」入力制御      */
  /* 引数: 計算式             */
  /* 戻り値: 計算式           */
  function key_input_control_full_stop(formula)
  {
    if (check_formula_complete(formula + ".0"))
    {
      formula += ".";
    }
    else if (check_operator(formula.slice(-1)))
    {
      formula += "0.";
    }
    
    return formula;
  }
  
  /* 関数: 演算子入力制御     */
  /* 引数: 入力された演算子   */
  /*       計算式             */
  /* 戻り値: 計算式           */
  function key_input_control_operator(key, formula)
  {
    switch (key)
    {
      case "-":
        if (formula == "0")
        {
          formula = key;
          break;
        }
      case "+":
      case "*":
      case "/":
        if ($.isNumeric(formula.slice(-1)) == false)
        {
          if ($.isNumeric(formula.slice(-2)[0]) == false)
          {
            if ((formula.slice(-1) == "-") && (key == "+"))
            {
              formula = formula.slice(0, -1);
            }
            
            break;
          }
          
          formula = formula.slice(0, -1); 
        }
        
        formula += key;
    }
    
    return formula;
  }
  
  /* 関数: 数値入力制御       */
  /* 引数: 入力された数値     */
  /*       計算式             */
  /* 戻り値: 計算式           */
  function key_input_control_numeric(key, formula)
  {
    if (key == 0)
    {
      if (formula.slice(-1) == ".")
      {
        formula += key;
      }
      else if ($.isNumeric(formula.slice(-1)) == false)
      {
        formula += "0";
      }
      else if (check_right_side_zero(formula) == false)
      {
        formula += key;
      }
    }
    else
    {
      if (check_right_side_zero(formula))
      {
        formula = formula.slice(0, -1) + key;
      }
      else
      {
        formula += key;
      }
    }
    
    return formula;
  }
  
  /* 関数: 右辺取得           */
  /* 引数: 計算式             */
  /* 戻り値: 右辺             */
  function get_left_side(formula)
  {
    let result = "";
    let split_value;
    let full_stop_exist = false;
    
    for (let i = 0; i < formula.length; i++)
    {
      split_value = formula.split('')[i];
      
      if ($.isNumeric(split_value) == false)
      {
        if ((full_stop_exist == false) && (split_value == "."))
        {
          full_stop_exist = true;
        }
        else
        {
          if (result == "")
          {
            result = split_value;
          }
          
          break;
        }
      }
      
      result += split_value;
    }
    
    return result;
  }
  
  /* 関数: 演算子優先順位確認 */
  /* 引数: 1文字              */
  /* 戻り値: 演算優先順位     */
  function check_operator_priority(value)
  {
    let result = -1;
    
    switch (value)
    {
      case "+":
      case "-":
        result = 0;
        break;
      case "*":
      case "/":
        result = 1;
    }
    
    return result;
  }
  
  /* 関数: 計算実行         */
  /* 引数: 計算式           */
  /* 戻り値: 計算結果       */
  function calculation_control(formula)
  {
    let formula_split;
    
    formula_split = formula_split_execution(formula);
    formula_split = calculation_execution_control(1, formula_split);  /* 乗算,除算を実行する. */
    formula_split = calculation_execution_control(0, formula_split);  /* 加算,減算を実行する. */
    
    return formula_split[0];
  }
  
  /* 関数: 計算式分割実行   */
  /* 引数: 計算式           */
  /* 戻り値: 分割した計算式 */
  function formula_split_execution(formula)
  {
    let formula_split = [];
    let i = 0;
    let j = 0;
    
    /* 少数含む数値と記号を分割する. */
    while (formula.length > 0)
    {
      formula_split.push(get_left_side(formula));
      formula = formula.slice(formula_split[i].length);
      i++;
    }
    
    /* 指数表記であれば,指数表記として扱う. */
    for (i = 1; i < 3; i++)
    {
      if (formula_split[i] == "e")
      {
        for (j = 1; j <= i + 2; j++)
        {
          formula_split[0] += formula_split[j];
        }
        
        formula_split.splice(1, j - 1);
        break;
      }
    }
    
    /* マイナス値であれば,マイナス値として扱う.*/
    if (j == 0)
    {
      i = 0;
    }
    else
    {
      i = 2;
    }
    
    while (i < formula_split.length)
    {
      if (formula_split[i] == "-")
      {
        formula_split[i] += formula_split[i + 1];
        formula_split.splice(i + 1, 1);
      }
      
      /* 次の演算子へ移動する. */
      i += 2;
    }
    
    return formula_split;
  }
  
  /* 関数: 計算実行制御     */
  /* 引数: 演算優先順位     */
  /*       分割した計算式   */
  /* 戻り値: 分割した計算式 */
  function calculation_execution_control(priority, formula_split)
  {
    let operator_positon = 1;
    let subtotal;
    
    while (operator_positon <= formula_split.length - 1)
    {
      if (check_operator_priority(formula_split[operator_positon]) == priority)
      {
        subtotal = calculation_execution(formula_split[operator_positon - 1], formula_split[operator_positon], formula_split[operator_positon + 1]);
        formula_split[operator_positon - 1] = subtotal;
        formula_split.splice(operator_positon, 2);
      }
      else if (priority > 0)
      {
        /* 次の演算子へ移動する. */
        operator_positon += 2;
      }
    }
    
    return formula_split;
  }
  
  /* 関数: 計算実行         */
  /* 引数: 左辺             */
  /*       演算子           */
  /*       右辺             */
  /* 戻り値: 計算結果       */
  function calculation_execution(left_side, operator, right_side)
    {
      let result;
      
      left_side = Number(left_side);
      right_side = Number(right_side);
      
      switch (operator)
      {
        case "+":
          result = left_side + right_side;
          break;
        case "-":
          result = left_side - right_side;;
          break;
        case "*":
          result = left_side * right_side;
          break;
        case "/":
          result = left_side / right_side;
          break;
      }
      
      if ($.isNumeric(result) == false)
      {
        /* 計算結果がエラー(0除算等)であれば0を返す. */
        result = 0;
      }
      
      return result;
    }
    
    /* 関数: 計算式完成確認   */
    /* 引数: 計算式           */
    /* 戻り値: true  : 完成   */
    /*         false : 未完成 */
    function check_formula_complete(formula)
    {
      return /^-?\d+(\.\d+)?(e[\+\-]\d+)?(([\+\-]\d+(\.\d+)?)|([\*\/]\-?\d+(\.\d+)?))*$/.test(formula);
    }
    
    /* 関数: 演算子確認       */
    /* 引数: 1文字            */
    /* 戻り値: true  : 演算子 */
    /*         false : その他 */
    function check_operator(value)
    {
      return /^[\+\-\*\/]$/.test(value);
    }
    
    /* 関数: 右辺0確認        */
    /* 引数: 計算式           */
    /* 戻り値: true  : 0      */
    /*         false : その他 */
    function check_right_side_zero(formula)
    {
      return /(^0$)|(^.*[\+\-\*\/]0$)/.test(formula);
    }
});