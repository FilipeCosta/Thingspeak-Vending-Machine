$(document).ready(function () {
    
    const apiKeyLeitura = "69POVOV21P8AWQF5"; // variavel que representa o codigo para ler na app
    const apiKeyEscrita = "HHAW3ASD7DWEKC52"; // variavel que representa o codigo para escrever na app
    var  stockMaximo = 10;
    const stockMinimo = 0;
    
    function loadProducts(){
        $.ajax({
        url: " https://api.thingspeak.com/channels/202184/feeds",
        dataType: 'json',
        cache: false,
        beforeSend: function () { // necessário visto as quantidades do produto aparecerem apenas depois da informação da div, neste caso a informação dos produtos apenas aparece depois de efetuado o pedido ajax
            $(".gears").show();
        },
        complete: function () {
            $('.gears').hide(); // previne que o gif de carregamento seje mostrado mesmo que o pedido ajax falhe
        },
        data: {
            api_key: apiKeyLeitura,
        },
        success: function (data) {
            console.log(data);
                var fields = data.feeds[data.feeds.length - 1]; // todos os campos do objecto 
                var productNames = data.channel; // necessário para adicionar produtos dinamicamente visto estes poderem ser eliminados e editados o que na realidade correspondende á edição de um canal 
                var count = 0;
                delete fields.created_at; // eliminar propriedas desnecessárias como a data, é apenas importante neste momento a quantidade de produtos
                delete fields.entry_id; // elimina propriedade desnecessária
                delete productNames.created_at;
                delete productNames.entry_id;
                $('.containerProducts').show();
                console.log(data.feeds);
                   
            for(var key in fields){
                $(".productName").eq(count).html(productNames[key]);
                $(".quantidadeProduto").eq(count).html(fields[key]); // itera sobre a classe seccaoProduto e acrescenta a quantidade para cada produto
                count++; // indcrementa uma variavel inteira para utilizar com o eq do jquery visto o key estar em formato string
            }
        }
    });    
    }
    

     // Post, atualizacao do stock de produtos de forma automatica preenchimento da máquina de vending
    $("#preencherStock").click(function(){
        var stockCheio = true;
        $(".quantidadeProduto").each(function(key,value){
            console.log($(value).text());
            if($(value).text()!= stockMaximo){
                stockCheio = false;
            }
        });

        if(!stockCheio)
        { 
            $.ajax({
                url: "https://api.thingspeak.com/update.json",
                dataType: 'json',
                type: 'POST',
                data: {
                    api_key: apiKeyEscrita,
                    field1: stockMaximo,
                    field2: stockMaximo,
                    field3: stockMaximo,
                    field4: stockMaximo,
                    field5: stockMaximo,
                    field6: stockMaximo,
                    field7: stockMaximo,
                    field8: stockMaximo
                },           
                success: function(data){
                    loadProducts();
                },
                error: function(xhr,error){
                    console.log(xhr);
                    console.log(error);
                }
            });
        }
        else 
        {
            alert("stock já se encontra preenchido");
        }
    });

    $(".DecrementaProduto").click(function(){
       var fieldIndex = $(".SeccaoProduto").index($(this).parent()); // obtem o indice da seccao do produto clicado
       var newValue = $(".quantidadeProduto").eq(fieldIndex).text(); 
       if(parseInt(newValue) > 0){
           console.log("a");
           $(".quantidadeProduto").eq(fieldIndex).text(newValue-1);  // decrementa um valor á quantidade que já estáva no produto
       }
    });

     $(".IncrementaProduto").click(function(){
       var fieldIndex = $(".SeccaoProduto").index($(this).parent()); // obtem o indice da seccao do produto clicado
       var newValue = $(".quantidadeProduto").eq(fieldIndex).text(); 
       if(parseInt(newValue) < stockMaximo)
         $(".quantidadeProduto").eq(fieldIndex).text(parseInt(newValue)+1);
    });


    $("#AtualizaStock").click(function(){
       var ProdutosQuantidades = []; // array com as quantidades dos produtos todos
       for(var i = 0;i<8;i++){
           ProdutosQuantidades.push($(".quantidadeProduto").eq(i).text()); // passa as quantidades todas para o array
       }
       $.ajax({
                url: "https://api.thingspeak.com/update.json?",
                dataType: 'json',
                type: 'POST',
                data: {
                    api_key: apiKeyEscrita,
                    field1:ProdutosQuantidades[0],
                    field2:ProdutosQuantidades[1],
                    field3:ProdutosQuantidades[2],
                    field4:ProdutosQuantidades[3],
                    field5:ProdutosQuantidades[4],
                    field6:ProdutosQuantidades[5],
                    field7:ProdutosQuantidades[6],
                    field8:ProdutosQuantidades[7],
                    
                },           
                success: function(data){
                    console.log(data);
                },
                error: function(xhr,error){
                    console.log(xhr);
                    console.log(error);
                }
        });
    });
    loadProducts();
});