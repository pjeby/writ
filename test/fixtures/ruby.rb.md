# Ruby test

    class Person
      #:: init ::#
      #:: greet method ::#
    end

Init:

    #== init ==#

    def initialize(name)
      @name = name
    end

Greet:

    #== greet method ==#

    def greet
      puts "Hi, I'm #{name}!"
    end
