$(document).ready(function(){
    const stockMaximo = 10; // quantidade maxima de produtos suportados pela máquina de vending
    const apiKeyLeitura = "69POVOV21P8AWQF5"; // variavel que representa o codigo para ler na app
    const apiKeyEscrita = "HHAW3ASD7DWEKC52"; // variavel que representa o codigo para escrever na app
    // pedido ajax efetuado após o carregamento da página, para obter a informação da quantidade dos produtos presentes no momento na máquina
    const produtoQuaseEsgotado = 0.25;

    $("#formularioEdicao").hide();
    $('.slider').slider();
    
    $.ajax({
            url: " https://api.thingspeak.com/channels/202184/feeds",
            dataType: 'json',
            cache: false,
            beforeSend: function(){ // necessário visto as quantidades do produto aparecerem apenas depois da informação da div, neste caso a informação dos produtos apenas aparece depois de efetuado o pedido ajax
                $(".gears").show();
            },
            complete: function(){
                $('.gears').hide(); // previne que o gif de carregamento seje mostrado mesmo que o pedido ajax falhe
            },
            data: {
                api_key: apiKeyLeitura,
            },           
            success: function(data){
                var fields = data.feeds[data.feeds.length - 1]; // todos os campos do objecto 
                var productNames = data.channel; // necessário para adicionar produtos dinamicamente visto estes poderem ser eliminados e editados o que na realidade correspondende á edição de um canal 
                var count = 0;
                delete fields.created_at; // eliminar propriedas desnecessárias como a data, é apenas importante neste momento a quantidade de produtos
                delete fields.entry_id; // elimina propriedade desnecessária
                delete productNames.created_at;
                delete productNames.entry_id;
                $('.containerProducts').show();

                   
            for(var key in fields){
                $(".productName").eq(count).html(productNames[key]);
                $(".quantidadeProduto").eq(count).html(fields[key]); // itera sobre a classe seccaoProduto e acrescenta a quantidade para cada produto
                count++; // indcrementa uma variavel inteira para utilizar com o eq do jquery visto o key estar em formato string
            }

            geraAvisos(data); 

            },
            error: function(xhr,error){
                console.log(xhr);
                console.log(error);
            }
        });

        $(".editar").click(function(){
            $('.containerProducts').hide();
            $('#formularioEdicao').show();
            var fieldIndex = $(".SeccaoProduto").index($(this).parent()); // obtem o indice da seccao do produto clicado
            var quantidade = $(".quantidadeProduto").eq(fieldIndex).text(); 
            var nomeProduto = $(".productName").eq(fieldIndex).text();

            $("#EditarNomeProduto").val(nomeProduto);

            $('.sliderProducts').slider({
                min: 0,
                max: stockMaximo,
                value: quantidade
            });  

            $("#GuardarEdicao").click(function(){
            var nomeNovoProduto = $("#EditarNomeProduto").val();
            var novaQuantidade = $(".sliderProducts").val();
            var ProdutosQuantidades = []; // array com as quantidades dos produtos todos
            for(var i = 0;i<8;i++){
                ProdutosQuantidades.push($(".quantidadeProduto").eq(i).text()); // passa as quantidades todas para o array
            }
           
           ProdutosQuantidades[fieldIndex] = novaQuantidade;

            console.log(ProdutosQuantidades);


            $.ajax({
                url: "https://api.thingspeak.com/channels/202184.json?field" + (fieldIndex + 1) + "=" + nomeNovoProduto,  //passagem do fieldIndex encontrado em cima referente ao indice da secção do produto 
                type: "PUT",
                data: {
                    api_key: "45S3SNHOTPCK7ALX",
                },
                success: function(){
                console.log("success first");
                    $.ajax({
                        url: "https://api.thingspeak.com/update.json", 
                        type:"POST",
                        data: {
                            api_key: apiKeyEscrita,
                            field1: ProdutosQuantidades[0],
                            field2: ProdutosQuantidades[1],
                            field3: ProdutosQuantidades[2],
                            field4: ProdutosQuantidades[3],
                            field5: ProdutosQuantidades[4],
                            field6: ProdutosQuantidades[5],
                            field7: ProdutosQuantidades[6],
                            field8: ProdutosQuantidades[7],
                        },
                        error:function(){
                            console.log("falha na atualização dos campos das quantidades");         
                        },
                        success:function(){
                            console.log("produto editado com sucesso");
                        }
                    });   
                },
                error: function(){
                    console.log("erro ao efetuar alteração do nome do campo" + fieldIndex +  "do canal");
                }
            });

   
            });
            
        });  

        $("#PageBack").click(function(e){
            e.preventDefault();
            $('.containerProducts').show();
            $('#formularioEdicao').hide();
        });



        function geraAvisos(data){

            var fields = data.feeds[data.feeds.length - 1];
            var productNames = data.channel;
            var stockPercentagemProduto = stockMaximo * produtoQuaseEsgotado;
            var totalMaquina = stockMaximo * 8;
            var SomaMaquinaAtual = 0; 
            var percentagemTotal;
            console.log(fields);
            for(var key in fields){
                if(fields[key] == 0){
                    $("#Avisos").append("<div class='alert alert-warning' role='alert'><p>o produto<b> " + productNames[key]  + " </b> está com o stock esgotado</p></div>")
                }
                else if(fields[key] < stockPercentagemProduto){
                    $("#Avisos").append("<div class='alert alert-warning' role='alert'><p>o stock do produto<b> " + productNames[key]  + " </b> está abaixo dos 25%</p></div>")
                }
                SomaMaquinaAtual += parseInt(fields[key]);
            }
                percentagemTotal = (100 * (SomaMaquinaAtual/totalMaquina));
                $("#Avisos").append("<div class='alert alert-warning' role='alert'><p>a percentagem do stock da <b>máquina</b> encontra-se atualmente nos <b>"+percentagemTotal.toFixed(1)+"%</b></p></div>");
        }

    });